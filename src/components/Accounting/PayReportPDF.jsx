import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import moment from 'moment';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
  },
  companyInfo: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: '#111827',
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  infoItem: {
    width: '33%',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#111827',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 8,
    textAlign: 'left',
  },
  loadDetails: {
    flexDirection: 'column',
  },
  date: {
    fontSize: 10,
    fontWeight: 500,
  },
  location: {
    fontSize: 9,
    color: '#6b7280',
  },
  rateDetails: {
    flexDirection: 'column',
  },
  amount: {
    fontSize: 10,
    fontWeight: 500,
  },
  calculation: {
    fontSize: 9,
    color: '#6b7280',
  },
  total: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 500,
  },
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  grandTotal: {
    flex: 1,
    fontSize: 12,
    padding: 8,
    textAlign: 'right',
    color: '#059669',
    fontWeight: 700,
  },
});

const PayReportPDF = ({ reportData }) => {
  if (!reportData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Ma'lumotlar mavjud emas</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{reportData.company_info?.name || 'N/A'}</Text>
          <Text style={styles.companyDetails}>{reportData.company_info?.address || 'N/A'}</Text>
          <Text style={styles.companyDetails}>{reportData.company_info?.location || 'N/A'}</Text>
          <Text style={styles.companyDetails}>Phone: {reportData.company_info?.phone || 'N/A'}</Text>
          {reportData.company_info?.fax && (
            <Text style={styles.companyDetails}>Fax: {reportData.company_info.fax}</Text>
          )}
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {reportData.driver_details?.first_name || 'N/A'} {reportData.driver_details?.last_name || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{reportData.driver_details?.contact_number || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{reportData.driver_details?.address1 || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Report Dates */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Report Date:</Text>
              <Text style={styles.value}>
                {reportData.driver_details?.report_date ? moment(reportData.driver_details.report_date).format('YYYY-MM-DD') : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Generation Date:</Text>
              <Text style={styles.value}>
                {reportData.driver_details?.generate_date ? moment(reportData.driver_details.generate_date).format('YYYY-MM-DD') : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Search Period:</Text>
              <Text style={styles.value}>
                {reportData.driver_details?.search_from || 'N/A'} - {reportData.driver_details?.search_to || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Load Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Load #</Text>
              <Text style={styles.tableCell}>Pickup</Text>
              <Text style={styles.tableCell}>Delivery</Text>
              <Text style={styles.tableCell}>Rate</Text>
              <Text style={styles.tableCell}>Notes</Text>
              <Text style={styles.tableCell}>Total Pay</Text>
            </View>

            {/* Table Body */}
            {reportData.loads?.map((load, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{load.load_number || 'N/A'}</Text>
                <View style={[styles.tableCell, styles.loadDetails]}>
                  <Text style={styles.date}>{load.pickup?.date || 'N/A'}</Text>
                  <Text style={styles.location}>{load.pickup?.location || 'N/A'}</Text>
                </View>
                <View style={[styles.tableCell, styles.loadDetails]}>
                  <Text style={styles.date}>{load.delivery?.date || 'N/A'}</Text>
                  <Text style={styles.location}>{load.delivery?.location || 'N/A'}</Text>
                </View>
                <View style={[styles.tableCell, styles.rateDetails]}>
                  <Text style={styles.amount}>${load.rate?.amount?.toFixed(2) || '0.00'}</Text>
                  <Text style={styles.calculation}>* {load.rate?.percentage || '0'}%</Text>
                  <Text style={styles.total}>${load.rate?.total?.toFixed(2) || '0.00'}</Text>
                </View>
                <Text style={styles.tableCell}>{load.notes || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.total]}>
                  ${load.total_pay?.toFixed(2) || '0.00'}
                </Text>
              </View>
            ))}

            {/* Summary Row */}
            <View style={[styles.tableRow, styles.summaryRow]}>
              <Text style={[styles.tableCell, { flex: 5 }]}>Total Pay:</Text>
              <Text style={styles.grandTotal}>
                ${reportData.total_pay?.toFixed(2) || '0.00'} USD
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PayReportPDF; 