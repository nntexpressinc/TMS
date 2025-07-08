import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const API_URL = 'https://ezpzfleetnodir.biznes-armiya.uz';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 140,
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  headerText: {
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    height: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  companyInfo: {
    width: '50%',
    flexDirection: 'row',
  },
  companyLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  companyDetails: {
    flex: 1,
  },
  driverInfo: {
    width: '40%',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  loadSection: {
    marginBottom: 25,
    breakInside: 'avoid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'Helvetica-Bold',
  },
  tableHeaderText: {
    fontFamily: 'Helvetica-Bold',
  },
  loadNumber: {
    width: '15%',
  },
  pickup: {
    width: '25%',
  },
  delivery: {
    width: '25%',
  },
  rate: {
    width: '20%',
    textAlign: 'right',
  },
  notes: {
    width: '15%',
  },
  totalPay: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  additionsTable: {
    width: '50%',
    marginBottom: 10,
  },
  deductionsTable: {
    width: '100%',
    marginBottom: 10,
  },
  amount: {
    textAlign: 'right',
  },
  positiveAmount: {
    color: 'green',
  },
  negativeAmount: {
    color: 'red',
  },
  totalsSection: {
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 10,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  grandTotalLabel: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 10,
  },
  grandTotalValue: {
    fontFamily: 'Helvetica-Bold',
    width: 100,
    textAlign: 'right',
    fontSize: 12,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  otherPayments: {
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  paymentType: {
    width: '30%',
  },
  paymentAmount: {
    width: '20%',
    textAlign: 'right',
  },
  otherPaymentsTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#fafafa',
  },
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const Header = ({ reportData }) => {
  const companyInfo = reportData.company_info || {};
  const logoUrl = companyInfo.company_logo 
    ? `${API_URL}${companyInfo.company_logo}`
    : null;

  return (
    <View style={styles.header} fixed>
      <View style={styles.companyInfo}>
        {logoUrl && (
          <Image style={styles.companyLogo} src={logoUrl} />
        )}
        <View style={styles.companyDetails}>
          <Text style={styles.headerTitle}>{companyInfo.company_name || 'Company Name'}</Text>
          <Text style={styles.headerText}>{companyInfo.city || 'City'}, {companyInfo.state || 'State'} {companyInfo.zip || 'Zip'}</Text>
          <Text style={styles.headerText}>Phone: {companyInfo.phone || 'N/A'}</Text>
          <Text style={styles.headerText}>Fax: {companyInfo.fax || 'N/A'}</Text>
          
        </View>
      </View>
      <View style={styles.driverInfo}>
        <Text style={styles.headerTitle}>Driver: {reportData.driver?.first_name || 'N/A'} {reportData.driver?.last_name || ''}</Text>
        <Text style={styles.headerText}>Address: {reportData.driver?.address1 || 'N/A'}</Text>
        <Text style={styles.headerText}>Phone #: {reportData.driver?.contact_number || 'N/A'}</Text>
        <Text style={styles.headerText}>Report Date: {formatDate(reportData.driver?.report_date)}</Text>
        <Text style={styles.headerText}>Search From: {formatDate(reportData.driver?.search_from)}</Text>
        <Text style={styles.headerText}>Search To: {formatDate(reportData.driver?.search_to)}</Text>
        <Text style={styles.headerText}>Invoice: {reportData.driver?.invoice_number || 'N/A'}</Text>
      </View>
    </View>
  );
};

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
      `Page ${pageNumber} of ${totalPages}`
    )} />
  </View>
);

const LoadSection = ({ load, index }) => (
  <View style={styles.loadSection}>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCol, styles.loadNumber]}>Load #</Text>
        <Text style={[styles.tableCol, styles.pickup]}>Pickup</Text>
        <Text style={[styles.tableCol, styles.delivery]}>Delivery</Text>
        <Text style={[styles.tableCol, styles.rate]}>Rate</Text>
        <Text style={[styles.tableCol, styles.notes]}>Notes</Text>
        <Text style={[styles.tableCol, styles.totalPay]}>Total Pay</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCol, styles.loadNumber]}>{load['Load #']}</Text>
        <Text style={[styles.tableCol, styles.pickup]}>{load.Pickup}</Text>
        <Text style={[styles.tableCol, styles.delivery]}>{load.Delivery}</Text>
        <Text style={[styles.tableCol, styles.rate]}>{load.Formula}</Text>
        <Text style={[styles.tableCol, styles.notes]}>{load.Notes || ''}</Text>
        <Text style={[styles.tableCol, styles.totalPay]}>{load.Result}</Text>
      </View>
    </View>
    {load['Other Payments']?.length > 0 && (
      <View style={styles.otherPaymentsTable}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, { width: '25%' }]}>Payment Type</Text>
          <Text style={[styles.tableCol, { width: '35%' }]}>Formula</Text>
          <Text style={[styles.tableCol, { width: '20%' }]}>Note</Text>
          <Text style={[styles.tableCol, { width: '20%' }]}>Amount</Text>
        </View>
        {load['Other Payments'].map((payment, pIndex) => (
          <View key={pIndex} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: '25%' }]}>{payment.pay_type}</Text>
            <Text style={[styles.tableCol, { width: '35%' }]}>{payment.formula}</Text>
            <Text style={[styles.tableCol, { width: '20%' }]}>{payment.note || '-'}</Text>
            <Text style={[styles.tableCol, styles.amount, payment.result?.startsWith('-') ? styles.negativeAmount : styles.positiveAmount, { width: '20%' }]}>{payment.result}</Text>
          </View>
        ))}
      </View>
    )}
    {load['Chargebag Deduction'] && (
      <View style={styles.otherPaymentsTable}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCol, { width: '25%' }]}>CHARGEBAG</Text>
          <Text style={[styles.tableCol, { width: '55%' }]}></Text>
          <Text style={[styles.tableCol, styles.negativeAmount, { width: '20%' }]}>-{load['Chargebag Deduction']}</Text>
        </View>
      </View>
    )}
  </View>
);

const TotalsSection = ({ reportData }) => (
  <View style={styles.totalsSection}>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total Load Pays:</Text>
      <Text style={styles.totalValue}>{reportData.total_load_pays?.Result || '$0.00'}</Text>
    </View>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total Other Pays:</Text>
      <Text style={styles.totalValue}>{reportData.total_other_pays?.Result || '$0.00'}</Text>
    </View>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total Additions:</Text>
      <Text style={[styles.totalValue, styles.positiveAmount]}>+{reportData.total_income?.Result || '$0.00'}</Text>
    </View>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total Deductions:</Text>
      <Text style={[styles.totalValue, styles.negativeAmount]}>-{reportData.total_expenses?.Result || '$0.00'}</Text>
    </View>
    <View style={styles.grandTotal}>
      <Text style={styles.grandTotalLabel}>Grand Total:</Text>
      <Text style={[styles.grandTotalValue, reportData.total_pay?.Result?.startsWith('-') ? styles.negativeAmount : styles.positiveAmount]}>{reportData.total_pay?.Result || '$0.00'}</Text>
    </View>
  </View>
);

const PayReport = ({ reportData }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Header reportData={reportData} />
        <View style={styles.content}>
          <Text style={styles.title}>Driver Pay Report</Text>
          {/* Loads Section */}
          <View className="section">
            {reportData.loads?.map((load, index) => (
              <View key={index} wrap={false}>
                <LoadSection load={load} index={index} />
              </View>
            ))}
          </View>
          {reportData.expenses?.filter(e => e.Type === 'Income').length > 0 && (
            <View wrap={false}>
              <Text style={styles.sectionTitle}>Recurring Addition</Text>
              <View style={styles.additionsTable}>
                <View style={styles.table}>
                  {reportData.expenses
                    .filter(e => e.Type === 'Income')
                    .map((addition, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCol, { width: '80%' }]}>{addition.Description}</Text>
                        <Text style={[styles.tableCol, styles.amount, styles.positiveAmount, { width: '20%' }]}>+{addition.Result}</Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          )}
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Recurring Deduction</Text>
            <View style={styles.deductionsTable}>
              <View style={styles.table}>
                {reportData.escrow_deduction && (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { width: '80%' }]}>Escrow Deduction</Text>
                    <Text style={[styles.tableCol, styles.negativeAmount, { width: '20%' }]}>-{reportData.escrow_deduction.Result}</Text>
                  </View>
                )}
                {reportData.chargeback_deductions?.map((deduction, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCol, { width: '80%' }]}>Chargebag Deduction ({deduction.note || ''})</Text>
                    <Text style={[styles.tableCol, styles.negativeAmount, { width: '20%' }]}>-{deduction.amount}</Text>
                  </View>
                ))}
                {reportData.expenses
                  ?.filter(e => e.Type === 'Expense')
                  .map((expense, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCol, { width: '80%' }]}>{expense.Description}</Text>
                      <Text style={[styles.tableCol, styles.negativeAmount, { width: '20%' }]}>-{expense.Result}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>
          <View wrap={false}>
            <TotalsSection reportData={reportData} />
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
};

export default PayReport;