"use client";

import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { IrisData } from '../utils/data';

interface ExportToolsProps {
  data?: IrisData[];
  analysisResults?: any;
  chartRef?: React.RefObject<HTMLDivElement | null> | null;
}

export const ExportTools: React.FC<ExportToolsProps> = ({
  data,
  analysisResults,
  chartRef
}) => {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => String(row[header as keyof IrisData])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'iris_analysis_data.csv';
    link.click();
  };

  const exportToJSON = () => {
    if (!analysisResults) return;
    
    const jsonContent = JSON.stringify(analysisResults, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'iris_analysis_results.json';
    link.click();
  };
  const exportChartAsPNG = async () => {
    if (!chartRef?.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = 'iris_chart.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  const exportAnalysisAsPDF = async () => {
    if (!analysisResults) return;
    
    try {
      const pdf = new jsPDF();
      let y = 20;
      
      // Title
      pdf.setFontSize(16);
      pdf.text('Iris Dataset Analysis Report', 20, y);
      y += 20;
      
      // Analysis results
      pdf.setFontSize(12);
      const text = JSON.stringify(analysisResults, null, 2);
      const lines = pdf.splitTextToSize(text, 170);
      
      lines.forEach((line: string) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 20, y);
        y += 7;
      });
      
      // Include chart if available
      if (chartRef?.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, 20, 170, 100);
      }
      
      pdf.save('iris_analysis_report.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
      <h4 className="w-full text-sm font-medium text-gray-700 mb-2">Export Options:</h4>
      
      {data && (
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          📊 CSV Data
        </button>
      )}
      
      {analysisResults && (
        <button
          onClick={exportToJSON}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          📄 JSON Results
        </button>
      )}
      
      {chartRef && (
        <button
          onClick={exportChartAsPNG}
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
        >
          🖼️ Chart PNG
        </button>
      )}
      
      {analysisResults && (
        <button
          onClick={exportAnalysisAsPDF}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          📑 PDF Report
        </button>
      )}
    </div>
  );
};
