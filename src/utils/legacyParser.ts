
export interface TrajSeries {
    name: string;
    data: number[];
}

export interface TrajDescriptor {
    fileName?: string;
    dataLength: number;
    data: TrajSeries[];
}

/**
 * Parses legacy trajectory data format based on C# TrajLoader.cs logic.
 * Handles '#' comments, '%' comments, and space/comma delimiters.
 * 
 * @param content The raw string content of the file
 * @param fileName Optional filename for metadata
 * @returns TrajDescriptor object or null if parsing fails
 */
export function parseLegacyTrajectory(content: string, fileName?: string): TrajDescriptor | null {
    try {
        // Normalize line endings and split
        const lines = content.split(/\r?\n/);

        if (lines.length === 0) return null;

        // Parse Header (skipping potential leading empty lines if any, though C# code implies line[0] is header)
        // C# logic: string namesStr = lines[0].Trim().TrimStart('#');
        let headerLineIndex = 0;
        while (headerLineIndex < lines.length && !lines[headerLineIndex].trim()) {
            headerLineIndex++;
        }
        if (headerLineIndex >= lines.length) return null;

        const headerLine = lines[headerLineIndex].trim().replace(/^#+/, '');
        const names = headerLine.split(/[,\s]+/).filter(s => s.trim().length > 0);

        const traj: TrajDescriptor = {
            fileName,
            dataLength: 0,
            data: names.map(name => ({
                name: name.replace(/^[#%]+/, ''), // C# TrimStart('%', '#')
                data: []
            }))
        };

        // Parse Body
        for (let i = headerLineIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();

            // C# logic: if (line.IndexOf('#') >= 0 || line.IndexOf('%') >= 0) continue;
            if (!line || line.includes('#') || line.includes('%')) {
                continue;
            }

            const parts = line.split(/[,\s]+/).filter(s => s.trim().length > 0);

            // C# logic: if (parts.Length != traj.data.Count) return null;
            if (parts.length !== traj.data.length) {
                console.warn(`Line ${i + 1} has ${parts.length} parts, expected ${traj.data.length}. Skipping or aborting? C# returns null.`);
                return null;
            }

            for (let idx = 0; idx < parts.length; idx++) {
                const val = parseFloat(parts[idx]);
                if (isNaN(val)) {
                    return null; // C# returns null on parse failure
                }
                traj.data[idx].data.push(val);
            }
        }

        traj.dataLength = traj.data[0]?.data.length || 0;
        return traj;

    } catch (e) {
        console.error("Parse functionality failed", e);
        return null;
    }
}
