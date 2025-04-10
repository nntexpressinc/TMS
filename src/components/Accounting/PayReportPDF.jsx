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
  otherPayments: {
    marginLeft: 20,
    paddingLeft: 10,
    borderLeft: 1,
    borderLeftColor: '#e5e7eb',
    marginTop: 4,
    marginBottom: 4,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    fontSize: 9,
  },
  paymentType: {
    width: 100,
    color: '#6b7280',
  },
  paymentAmount: {
    width: 80,
    textAlign: 'right',
  },
  paymentNote: {
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  positiveAmount: {
    color: '#059669',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  chargebagDeduction: {
    color: '#dc2626',
    fontWeight: 500,
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
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Load #</Text>
              <Text style={styles.tableCell}>Pickup</Text>
              <Text style={styles.tableCell}>Delivery</Text>
              <Text style={styles.tableCell}>Rate</Text>
              <Text style={styles.tableCell}>Load Total Pay</Text>
              <Text style={styles.tableCell}>Chargebag</Text>
              <Text style={styles.tableCell}>Notes</Text>
            </View>

            {reportData.loads.map((load, index) => (
              <View key={index}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>{load['Load #']}</Text>
                  <Text style={styles.tableCell}>{load.Pickup}</Text>
                  <Text style={styles.tableCell}>{load.Delivery}</Text>
                  <Text style={styles.tableCell}>{load.Rate}</Text>
                  <Text style={[styles.tableCell, styles.amount]}>{load['Load Total Pay']}</Text>
                  <Text style={[styles.tableCell, styles.chargebagDeduction]}>
                    {load['Chargebag Deduction'] ? `- ${load['Chargebag Deduction']}` : ''}
                  </Text>
                  <Text style={styles.tableCell}>{load.Notes || '-'}</Text>
                </View>
                
                {load['Other Payments'] && load['Other Payments'].length > 0 && (
                  <View style={styles.otherPayments}>
                    {load['Other Payments'].map((payment, pIndex) => (
                      <View key={pIndex} style={styles.paymentItem}>
                        <Text style={styles.paymentType}>{payment.pay_type}</Text>
                        <Text style={[
                          styles.paymentAmount,
                          payment.calculating.startsWith('-') ? styles.negativeAmount : styles.positiveAmount
                        ]}>
                          {payment.calculating.startsWith('-') ? '- ' : '+ '}
                          {payment.amount}
                        </Text>
                        {payment.note && (
                          <Text style={styles.paymentNote}>({payment.note})</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Expenses and Income Section */}
        <View style={styles.expensesSection}>
          {/* Additions Table */}
          <Text style={styles.sectionTitle}>Additions</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            {reportData.expenses
              .filter(expense => expense.Type === 'Income')
              .map((expense, index) => (
                <View key={index} style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>{expense.Description}</Text>
                  <Text style={[styles.expenseAmount, styles.positiveAmount]}>+ {expense.Amount}</Text>
                  <Text style={styles.expenseType}>Addition</Text>
                  <Text style={styles.expenseDate}>{expense.Date}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Deductions Table */}
        <View style={[styles.expensesSection, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            {reportData.expenses
              .filter(expense => expense.Type === 'Expense')
              .map((expense, index) => (
                <View key={index} style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>{expense.Description}</Text>
                  <Text style={[styles.expenseAmount, styles.negativeAmount]}>- {expense.Amount}</Text>
                  <Text style={styles.expenseType}>Deduction</Text>
                  <Text style={styles.expenseDate}>{expense.Date}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Final Summary */}
        <View style={styles.finalSummary}>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Load Pays:</Text>
            <Text style={[styles.finalSummaryValue, styles.positiveAmount]}>
              + {reportData.total_load_pays}
            </Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Other Pays:</Text>
            <Text style={[styles.finalSummaryValue, styles.positiveAmount]}>
              + {reportData.total_other_pays}
            </Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Deductions:</Text>
            <Text style={[styles.finalSummaryValue, styles.negativeAmount]}>
              - {reportData.total_expenses}
            </Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Total Additions:</Text>
            <Text style={[styles.finalSummaryValue, styles.positiveAmount]}>
              + {reportData.total_income}
            </Text>
          </View>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalSummaryLabel}>Escrow Deduction:</Text>
            <Text style={[styles.finalSummaryValue, styles.negativeAmount]}>
              - {reportData.escrow_deduction}
            </Text>
          </View>
          <View style={[styles.finalSummaryRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }]}>
            <Text style={[styles.finalSummaryLabel, { fontWeight: 700 }]}>Total Pay:</Text>
            <Text style={[styles.finalSummaryValue, { color: '#059669', fontSize: 14, fontWeight: 700 }]}>
              {reportData.total_pay}
            </Text>
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