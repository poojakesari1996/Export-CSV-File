import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import './App.css';

function App() {
    const [file, setFile] = useState(null);
    const [csvData, setCsvData] = useState([]);

    const sampleHeaders = ['Email', 'Name', 'MobileNumber'];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please choose a CSV file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        axios.post('http://localhost:5000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            parseCsv(file);
          
        })
        .catch(error => {
            console.error('There was an error uploading the file!', error);
            toast.error('Error uploading the file');
        });
    };

    const parseCsv = (file) => {
        Papa.parse(file, {
            header: true,
            complete: (result) => {
                const uploadedHeaders = Object.keys(result.data[0]);
                if (JSON.stringify(uploadedHeaders) !== JSON.stringify(sampleHeaders)) {
                    toast.error('Please download the sample file and upload the correct format.');
                    return;
                } else {
                    setCsvData(result.data);
                    toast.success('File uploaded successfully');
                }
            },
        });
    };

    const handleDownload = () => {
        axios.get('http://localhost:5000/download', {
            responseType: 'blob',
        })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data.csv');
            document.body.appendChild(link);
            link.click();
        })
        .catch(error => {
            console.error('There was an error downloading the file!', error);
            toast.error('Error downloading the file');
        });
    };

    const handleSampleDownload = () => {
        const sampleData = 'Email,Name,MobileNumber\nsample@example.com,Sample Name,1234567890';
        const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sample.csv');
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="App">
            <div className="container">
                <h1>CSV Upload and Download</h1>
                <div className="file-input">
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                    <button onClick={handleSampleDownload}>Download Sample</button>
                </div>
                {csvData.length > 0 && (
                    <div className="export-container">
                        <table>
                            <thead>
                                <tr>
                                    {sampleHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Object.values(row).map((value, colIndex) => (
                                            <td key={colIndex}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={handleDownload} className="export-button">Export Data</button>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default App;
