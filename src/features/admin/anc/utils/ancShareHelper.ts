import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import dayjs from 'dayjs';
import { ancService } from '../services/ancService';
import type { Pregnancy } from '../services/ancService';
import { message } from 'antd';

/** 
 * Generates a PDF from a DOM element, 
 * optionally downloads it locally,
 * and sends it to the backend for Email sharing via Nodemailer.
 */
export const shareAncCardViaBackend = async ({
    element,
    pregnancyData,
    fields,
    downloadLocally = false
}: {
    element: HTMLElement | null;
    pregnancyData: Pregnancy;
    fields: any;
    downloadLocally?: boolean;
}) => {
    if (!element || !pregnancyData) {
        message.error('Missing data to generate PDF');
        return false;
    }

    try {
        // 1. Generate Canvas from HTML
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');

        // 2. Create PDF via jsPDF
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);

        // 3. Optional Local Download
        if (downloadLocally) {
            pdf.save(`ANC_Card_${fields.patient_code}_${dayjs().format('YYYYMMDD')}.pdf`);
        }

        // 4. Prepare Payload for Backend (Base64)
        const file_base64 = pdf.output('datauristring');
        const payload = {
            file_base64,
            mother_name: fields.full_name,
            email: pregnancyData.mother.email || '',
        };

        // 5. Backend Call
        const hideLoading = message.loading('Sending card to patient email...', 0);
        await ancService.shareAncCard(pregnancyData.id, payload);
        hideLoading();

        message.success('Card sent successfully to patient email!');
        return true;
    } catch (error) {
        console.error('Anc Sharing Error:', error);
        message.error('Failed to share card. Please check backend services.');
        return false;
    }
};

/** Separate simple download helper */
export const downloadAncCardLocally = async (element: HTMLElement | null, fields: any) => {
    if (!element) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        pdf.save(`ANC_Card_${fields.patient_code}_${dayjs().format('YYYYMMDD')}.pdf`);
        message.success('Card downloaded successfully');
    } catch (err) {
        message.error('Download failed');
    }
};
