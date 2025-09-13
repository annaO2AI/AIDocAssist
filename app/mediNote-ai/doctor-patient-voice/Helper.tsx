 interface ParsedSession {
  date: string;
  session: string;
  sections: { title: string; content: string[] }[];
}

   const normalizeHeaderText = (headerText: string): string => {
    // Normalize headers according to requirements
    if (headerText.includes("Patient Chief Concerns")) {
      return "Patient Concerns and Symptoms";
    }
    if (headerText.includes("Possible Causes / Differential")) {
      return "Possible Causes";
    }
    if (headerText.includes("Doctor's Assessment")) {
      return "Doctor's Assessment and Plan";
    }
    return headerText;
  };

 export const parseHistoryField = (rawHistory: string): ParsedSession[] => {
    // If no history or empty string, return empty array
    if (!rawHistory || rawHistory.trim() === "") {
      return [];
    }
    
    const parts = rawHistory.split("---").filter(Boolean);

    return parts.map((block) => {
      const dateMatch = block.match(/Date:\s*(.+)/);
      const sessionMatch = block.match(/Session\s*(\d+)\s*summary:/);
      
      // Extract the summary content
      const summaryStart = block.indexOf("summary:");
      let summaryContent = block.slice(summaryStart + 8).trim();
      
      // Split into sections based on markdown headers
      const sectionRegex = /(^#{1,2} .+)$/gm;
      const sectionMatches = Array.from(summaryContent.matchAll(sectionRegex));
      
      const sections: { title: string; content: string[] }[] = [];
      
      // Process each section
      for (let i = 0; i < sectionMatches.length; i++) {
        const header = sectionMatches[i][0];
        const headerText = normalizeHeaderText(header.replace(/^#+ /, "").trim());
        
        // Find the content between this header and the next one
        const contentStart = sectionMatches[i].index + header.length;
        const contentEnd = i < sectionMatches.length - 1 
          ? sectionMatches[i + 1].index 
          : summaryContent.length;
        
        let content = summaryContent.slice(contentStart, contentEnd).trim();
        
        // Process bullet points and other content
        const contentLines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Remove markdown formatting for bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '$1');
            // Remove bullet points and numbering
            return line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
          })
          .filter(line => line.length > 0);
        
        sections.push({
          title: headerText,
          content: contentLines.length > 0 ? contentLines : ["No details provided"]
        });
      }
      
      // If no sections were found, add the entire content as one section
      if (sections.length === 0) {
        sections.push({
          title: "Encounter Summary",
          content: [summaryContent || "No summary available"]
        });
      }

      return {
        date: dateMatch ? dateMatch[1].trim() : "",
        session: sessionMatch ? sessionMatch[1].trim() : "",
        sections,
      };
    });
  };

export function formatArrayToString(sectionsArray:any) {
  let result = '';
  
  sectionsArray.forEach((section:any, index:number) => {
    // Add section title
    if (section.title === 'Encounter Summary') {
      result += `# ${section.title}\n`;
    } else {
      result += `## ${section.title}\n`;
    }
    
    // Add section content
    section.content.forEach((contentItem: string) => {
      if (Array.isArray(contentItem)) {
        // If content is an array, join with newlines
        result += contentItem.join('\n') + '\n';
      } else {
        // If content is a string, add it directly
        result += contentItem + '\n';
      }
    });
    
    // Add extra newline between sections (except for the last one)
    if (index < sectionsArray.length - 1) {
      result += '\n';
    }
  });
  
  return result;
}