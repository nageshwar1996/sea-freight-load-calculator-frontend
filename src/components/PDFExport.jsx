import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    color: '#34495e',
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    borderBottomStyle: 'solid',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 10,
  },
});

// PDF Document Component
const PDFDocument = ({ calculationData, cargoItems }) => {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Sea Freight Load Calculation Report</Text>
        
        <View style={styles.section}>
          <Text style={styles.title}>Calculation Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Parameter</Text>
              <Text style={styles.tableCell}>Value</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total CBM</Text>
              <Text style={styles.tableCell}>{calculationData.cbm} m³</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Suggested Container</Text>
              <Text style={styles.tableCell}>{calculationData.suggestedContainer}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Estimated Weight</Text>
              <Text style={styles.tableCell}>{calculationData.totalWeight} kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Cargo Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Item</Text>
              <Text style={styles.tableCell}>Dimensions (cm)</Text>
              <Text style={styles.tableCell}>Type</Text>
            </View>
            {cargoItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>Item {index + 1}</Text>
                <Text style={styles.tableCell}>
                  {item.length} x {item.width} x {item.height}
                </Text>
                <Text style={styles.tableCell}>
                  {item.isFragile ? 'Fragile' : 'Regular'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Generated on {currentDate} | Sea Freight Load Calculator
        </Text>
      </Page>
    </Document>
  );
};

// PDF Export Component
const PDFExport = ({ calculationData, cargoItems }) => {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <PDFViewer style={{ width: '100%', height: '100%' }}>
        <PDFDocument
          calculationData={calculationData}
          cargoItems={cargoItems}
        />
      </PDFViewer>
    </div>
  );
};

export default PDFExport; 