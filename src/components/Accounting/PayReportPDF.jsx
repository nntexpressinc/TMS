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
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 20,
  },
  companyInfo: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    color: '#111827',
  },
  companyDetails: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 15,
    color: '#111827',
    paddingBottom: 8,
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
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 500,
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
  expensesSection: {
    marginTop: 20,
  },
  expenseRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  expenseLabel: {
    flex: 2,
    fontSize: 10,
  },
  expenseAmount: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  expenseType: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  expenseDate: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  finalSummary: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: 1,
    borderColor: '#e5e7eb',
  },
  finalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  finalSummaryLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
  },
  finalSummaryValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
});

const PayReportPDF = ({ reportData }) => {
  if (!reportData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No data available</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{reportData.user_admin.company_name}</Text>
          <Text style={styles.companyDetails}>{reportData.user_admin.address}</Text>
          <Text style={styles.companyDetails}>{reportData.user_admin.country}</Text>
          <Text style={styles.companyDetails}>Phone: {reportData.user_admin.telephone}</Text>
          {reportData.user_admin.fax && (
            <Text style={styles.companyDetails}>Fax: {reportData.user_admin.fax}</Text>
          )}
          <Text style={styles.companyDetails}>Email: {reportData.user_admin.email}</Text>
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {reportData.driver.first_name} {reportData.driver.last_name}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{reportData.driver.contact_number}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{reportData.driver.address1}</Text>
            </View>
          </View>
        </View>

        {/* Report Dates */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Report Date:</Text>
              <Text style={styles.value}>
                {moment(reportData.driver.report_date).format('YYYY-MM-DD')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Generation Date:</Text>
              <Text style={styles.value}>
                {moment(reportData.driver.generate_date).format('YYYY-MM-DD')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Search Period:</Text>
              <Text style={styles.value}>
                {reportData.driver.search_from} - {reportData.driver.search_to}
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
            {reportData.loads.map((load, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{load['Load #']}</Text>
                <View style={[styles.tableCell, styles.loadDetails]}>
                  <Text style={styles.date}>{load.Pickup}</Text>
                </View>
                <View style={[styles.tableCell, styles.loadDetails]}>
                  <Text style={styles.date}>{load.Delivery}</Text>
                </View>
                <View style={[styles.tableCell, styles.rateDetails]}>
                  <Text style={styles.amount}>{load.Rate}</Text>
                </View>
                <Text style={styles.tableCell}>{load.Notes || '-'}</Text>
                <Text style={[styles.tableCell, styles.total]}>
                  {load['Total Pay']}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expenses Section */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Expenses and Income</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            {reportData.expenses.map((expense, index) => (
              <View key={index} style={styles.expenseRow}>
                <Text style={styles.expenseLabel}>{expense.Description}</Text>
                <Text style={styles.expenseAmount}>{expense.Amount}</Text>
                <Text style={styles.expenseType}>{expense.Type}</Text>
                <Text style={styles.expenseDate}>{expense.Date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final Summary */}
        <View style={styles.finalSummary}>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Expenses:</Text>
            <Text style={styles.finalSummaryValue}>{reportData.total_expenses}</Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Income:</Text>
            <Text style={styles.finalSummaryValue}>{reportData.total_income}</Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Escrow Deduction:</Text>
            <Text style={styles.finalSummaryValue}>{reportData.escrow_deduction}</Text>
          </View>
          <View style={[styles.finalSummaryRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }]}>
            <Text style={[styles.finalSummaryLabel, { fontWeight: 700 }]}>Total Pay:</Text>
            <Text style={[styles.finalSummaryValue, { color: '#059669' }]}>{reportData.total_pay}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {moment().format('MMMM D, YYYY')} at {moment().format('h:mm A')}
        </Text>
      </Page>
    </Document>
  );
};

export default PayReportPDF; 