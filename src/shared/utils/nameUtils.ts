export const formatName = (name: string | undefined | null) => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const formatDoctorName = (name: string | undefined | null) => {
    if (!name) return 'Dr.';
    
    let formatted = formatName(name);
    
    // If it already starts with "Dr." or "Dr " (case insensitive check done via formatted which is Title Case)
    if (formatted.startsWith('Dr.')) {
        return formatted;
    }
    
    if (formatted.startsWith('Dr ')) {
        // Change "Dr Name" to "Dr. Name"
        return formatted.replace(/^Dr\s+/, 'Dr. ');
    }
    
    return `Dr. ${formatted}`;
};
