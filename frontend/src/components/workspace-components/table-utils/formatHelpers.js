// Helper function to format date from YYYYMMDD to MM/DD/YYYY
const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return 'Unknown';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${month}/${day}/${year}`;
  };
  
  // Helper function to format patient name from LAST^FIRST to First Last
  const formatName = (nameString) => {
    if (!nameString) return 'Unknown';
    const parts = nameString.split('^');
    if (parts.length !== 2) return nameString;
    return `${parts[1]} ${parts[0]}`;
  };

  const formatAge = (ageString) =>{
    if (!ageString) return 'Unknown';
    let ageNumber;
    if(ageString[0] === '0'){
      ageNumber = ageString.substring(1, 3)
    }
    else{
      ageNumber = ageString.substring(0, 3)
    }

    if(ageString[ageString.length-1] === 'Y'){
      return ageNumber + ' years';
    }
    else if(ageString[ageString.length-1] === 'M'){
      return ageNumber + ' months';
    }
    else if(ageString[ageString.length-1] === 'D'){
      return ageNumber + ' days';
    }
    else{
      return ageNumber;
    }
  }

export {formatDate, formatName, formatAge};