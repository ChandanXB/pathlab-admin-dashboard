import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import type { Pregnancy } from '../services/ancService';
import { formatName } from '@/shared/utils/nameUtils';
import { PATHLAB_STAMP_BASE64 } from '@/shared/constants/assets';

/**
 * Generates a professional ANC Card PDF for a patient
 * Supports both direct download and dataURI return for previews
 */
export const generateAncPdf = (data: Pregnancy, outputType: 'save' | 'datauri' = 'save'): string | void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const primaryColor: [number, number, number] = [0, 74, 173]; // colors.primary equivalent in RGB
    const secondaryColor: [number, number, number] = [140, 140, 140]; // Text secondary in RGB

    // Helper to draw horizontal line
    const drawLine = (yPos: number) => {
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // --- HEADER ---
    // Background for header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ANTENATAL CARE (ANC) CARD', pageWidth / 2, 22, { align: 'center' });
    
    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Pathlab Maternal Health Care Center • Clinical Journey Record', pageWidth / 2, 32, { align: 'center' });
    
    // Document ID and Date
    doc.setFontSize(8);
    const generationDate = dayjs().format('DD MMM YYYY, HH:mm');
    doc.text(`Card Generated: ${generationDate}`, pageWidth - margin, 40, { align: 'right' });

    // --- PATIENT PROFILE SECTION ---
    let y = 60;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PATIENT PROFILE', margin, y);
    
    y += 8;
    drawLine(y);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ANC Reg. ID:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`ANC-${data.id.toString().padStart(4, '0')}`, margin + 25, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Patient Code:', margin + 100, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.mother.patient_code, margin + 125, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Full Name:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatName(data.mother.full_name), margin + 22, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Risk Level:', margin + 100, y);
    const risk = data.risk_level || 'Low';
    doc.setTextColor(risk === 'High' ? 220 : risk === 'Medium' ? 255 : 0, risk === 'High' ? 0 : risk === 'Medium' ? 140 : 128, 0); // Red, Orange, Green
    doc.text(risk.toUpperCase(), margin + 122, y);

    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact No:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.mother.phone, margin + 22, y);

    // --- CLINICAL HIGHLIGHTS ---
    y += 15;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CLINICAL HIGHLIGHTS', margin, y);
    
    y += 8;
    drawLine(y);

    y += 12;
    // Box-like display for G-P-A-L
    const boxX = margin;
    const labels = ['Gravida', 'Para', 'Abortion', 'Living'];
    const values = [data.gravida || 0, data.para || 0, data.abortions || 0, data.living_children || 0];
    
    labels.forEach((label, i) => {
        const xPos = boxX + (i * 45);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.rect(xPos, y, 35, 20);
        
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(7);
        doc.text(label.toUpperCase(), xPos + 17.5, y + 6, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(String(values[i]), xPos + 17.5, y + 15, { align: 'center' });
    });

    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('LMP DATE:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dayjs(data.lmp_date).format('DD MMM YYYY'), margin + 25, y);

    doc.setFont('helvetica', 'bold');
    doc.text('EDD DATE:', margin + 100, y);
    doc.setTextColor(220, 0, 0);
    doc.text(dayjs(data.edd_date).format('DD MMM YYYY'), margin + 122, y);

    // --- VISIT LOG TABLE ---
    y += 15;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ANTENATAL VISIT LOG', margin, y);
    y += 5;

    const visits = data.antenatal_visits || [];
    
    // Using autoTable for the visit list
    autoTable(doc, {
        startY: y + 5,
        margin: { left: margin, right: margin },
        head: [['Visit Date', 'Week', 'Weight (kg)', 'BP (mmHg)', 'Notes']],
        body: visits.map(v => [
            dayjs(v.visit_date).format('DD MMM YYYY'),
            `W${v.gestational_age_weeks}`,
            v.weight_kg ? `${v.weight_kg} kg` : '-',
            `${v.bp_systolic}/${v.bp_diastolic}`,
            v.notes || '-'
        ]),
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50],
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 70 }
        },
        theme: 'striped',
    });

    // Final Footer
    const lastTable = (doc as any).lastAutoTable;
    const finalY = lastTable ? lastTable.finalY + 20 : y + 20;

    if (finalY < pageHeight - 50) {
        // Official Stamp
        try {
            // Using the embedded Base64 stamp for higher reliability
            doc.addImage(PATHLAB_STAMP_BASE64, 'PNG', pageWidth - margin - 35, finalY - 10, 30, 30);
        } catch (e) {
            console.warn('Failed to render official stamp:', e);
        }

        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'italic');
        doc.text('This clinical record is officially certified and digitally validated by Pathlab Diagnostics.', margin, finalY + 15);
        
        doc.setFont('helvetica', 'normal');
        doc.text('Reported by Pathlab Maternal Health Services', margin, finalY + 20);
        
        // Branding tag at bottom
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(pageWidth - 60, pageHeight - 15, 60, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PATHLAB ANC', pageWidth - 30, pageHeight - 6, { align: 'center' });
    }

    // Handle Output
    if (outputType === 'save') {
        doc.save(`ANC_Card_${data.mother.patient_code}_${dayjs().format('YYYYMMDD')}.pdf`);
    } else {
        return doc.output('datauristring');
    }
};

