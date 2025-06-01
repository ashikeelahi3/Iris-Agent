"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, LineChart, Line,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { IrisData } from '../utils/data';

interface DataVisualizationProps {
  data: IrisData[];
  type: 'scatter' | 'bar' | 'line' | 'pie' | 'histogram';
  xColumn?: keyof IrisData;
  yColumn?: keyof IrisData;
  groupBy?: keyof IrisData;
  title?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type,
  xColumn,
  yColumn,
  groupBy,
  title
}) => {
  if (!data || data.length === 0) return null;

  const renderScatterPlot = () => {
    if (!xColumn || !yColumn) return null;
    
    const groupedData = groupBy 
      ? data.reduce((acc, item) => {
          const key = String(item[groupBy]);
          if (!acc[key]) acc[key] = [];
          acc[key].push({
            x: Number(item[xColumn]),
            y: Number(item[yColumn]),
            name: key
          });
          return acc;
        }, {} as Record<string, any[]>)
      : { all: data.map(item => ({
          x: Number(item[xColumn]),
          y: Number(item[yColumn])
        })) };    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={Object.values(groupedData)[0]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name={String(xColumn)} />
          <YAxis dataKey="y" name={String(yColumn)} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {Object.entries(groupedData).map(([key, values], index) => (
            <Scatter
              key={key}
              name={key}
              data={values}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    if (!xColumn) return null;
    
    const aggregatedData = data.reduce((acc, item) => {
      const key = String(item[xColumn]);
      if (!acc[key]) {
        acc[key] = { name: key, count: 0 };
        if (yColumn && typeof item[yColumn] === 'number') {
          acc[key].total = 0;
          acc[key].average = 0;
        }
      }
      acc[key].count++;
      if (yColumn && typeof item[yColumn] === 'number') {
        acc[key].total = (acc[key].total || 0) + Number(item[yColumn]);
        acc[key].average = acc[key].total / acc[key].count;
      }
      return acc;
    }, {} as Record<string, any>);

    const chartData = Object.values(aggregatedData);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Count" />
          {yColumn && <Bar dataKey="average" fill="#82ca9d" name={`Avg ${String(yColumn)}`} />}
        </BarChart>
      </ResponsiveContainer>
    );
  };
  const renderPieChart = () => {
    if (!xColumn) return null;
    
    const aggregatedData = data.reduce((acc, item) => {
      const key = String(item[xColumn]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(aggregatedData).map(([name, value]) => ({
      name,
      value
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderHistogram = () => {
    if (!xColumn || typeof data[0][xColumn] !== 'number') return null;
    
    // Create bins for histogram
    const values = data.map(item => Number(item[xColumn])).filter(val => !isNaN(val));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 10;
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0,
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Frequency" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  const renderChart = () => {
    switch (type) {
      case 'scatter':
        return renderScatterPlot();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'histogram':
        return renderHistogram();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-lg border">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      {renderChart()}    </div>
  );
};

// Remove the display name line since we're not using React.memo anymore
