import React, { useState } from 'react';
import { parseLegacyTrajectory } from '../../utils/legacyParser';
import './DataImportForm.css';

interface DataImportFormProps {
    title: string;
    data: any;
    onChange: (data: any) => void;
    description?: string;
}

export const DataImportForm: React.FC<DataImportFormProps> = ({ title, data, onChange, description }) => {
    const [jsonText, setJsonText] = useState(data ? JSON.stringify(data, null, 2) : '');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonText(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleValidateAndSave = () => {
        try {
            if (!jsonText.trim()) {
                onChange(undefined);
                setSuccess('Cleared successfully');
                return;
            }
            const parsed = JSON.parse(jsonText);
            // Basic validation could go here
            onChange(parsed);
            setError('');
            setSuccess('Valid JSON saved successfully!');
        } catch (err) {
            // Try Legacy Parser on manual input
            const legacyData = parseLegacyTrajectory(jsonText, 'manual-input');
            if (legacyData) {
                onChange(legacyData);
                setError('');
                setSuccess('Legacy format parsed and saved successfully!');
                setJsonText(JSON.stringify(legacyData, null, 2));
                return;
            }

            setError('Invalid JSON format. Please check your syntax.');
            setSuccess('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonText(content);

            // Try JSON first
            try {
                const parsed = JSON.parse(content);
                onChange(parsed);
                setError('');
                setSuccess('File loaded and saved successfully (JSON)!');
                return;
            } catch (err) {
                // If JSON fails, try Legacy Parser
                const legacyData = parseLegacyTrajectory(content, file.name);
                if (legacyData) {
                    onChange(legacyData);
                    setError('');
                    setSuccess('File loaded and saved successfully (Legacy Format)!');
                    // Update the text area to show the JSON representation of the parsed data for verification
                    setJsonText(JSON.stringify(legacyData, null, 2));
                    return;
                }

                setError('File contains invalid JSON and could not be parsed as Legacy format.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="data-import-form">
            <div className="data-import-header">
                <h4>{title}</h4>
                {description && <p>{description}</p>}
            </div>

            <div className="file-input-wrapper">
                <input
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="file-input"
                />
            </div>

            <div className="textarea-wrapper">
                <textarea
                    value={jsonText}
                    onChange={handleTextChange}
                    placeholder="Or paste JSON content here..."
                    rows={15}
                    className={`json-textarea ${error ? 'error' : success ? 'success' : ''}`}
                />
                {(error || success) && (
                    <div className={`status-message ${error ? 'error' : 'success'}`}>
                        {error || success}
                    </div>
                )}
            </div>

            <button
                onClick={handleValidateAndSave}
                className="save-button"
            >
                Validate & Save JSON
            </button>
        </div>
    );
};
