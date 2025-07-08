import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
    textAlign: 'left',
  },
  summaryTable: {
    flexDirection: 'row',
    marginBottom: 18,
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  summaryCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b6d7f7',
    borderRightWidth: 0,
    backgroundColor: '#fff',
  },
  summaryColLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b6d7f7',
    backgroundColor: '#fff',
  },
  summaryHeader: {
    backgroundColor: '#e3f0fb',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 11,
    borderBottomWidth: 1,
    borderColor: '#b6d7f7',
    textAlign: 'center',
  },
  summaryValue: {
    backgroundColor: '#cfe2f3',
    padding: 8,
    fontWeight: 'normal',
    fontSize: 12,
    textAlign: 'center',
  },
  summaryValueRed: {
    backgroundColor: '#cfe2f3',
    padding: 8,
    color: '#d90429',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3f0fb',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: '#b6d7f7',
    borderBottomWidth: 0,
    fontWeight: 'bold',
  },
  th: {
    padding: 7,
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1e293b',
    borderRightWidth: 1,
    borderColor: '#b6d7f7',
    textAlign: 'center',
  },
  thLast: {
    padding: 7,
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1e293b',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#cfe2f3',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 0,
  },
  rowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f6fbff',
    borderBottomWidth: 1,
    borderColor: '#cfe2f3',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 0,
  },
  td: {
    padding: 7,
    fontSize: 10,
    color: '#22223b',
    borderRightWidth: 1,
    borderColor: '#b6d7f7',
    textAlign: 'center',
  },
  tdLast: {
    padding: 7,
    fontSize: 10,
    color: '#22223b',
    textAlign: 'center',
  },
});

const CompanyDriverPDF = ({ data, driver, search_from, search_to }) => {
  if (!data) return null;
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    let num = amount;
    if (typeof num === 'string') {
      num = num.replace('$', '');
      num = parseFloat(num);
    }
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2);
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerTitle}>
          In total, {driver?.first_name || ''} {driver?.last_name || ''} drove in the week from {search_from} to {search_to}:
        </Text>
        {/* Summary Table */}
        <View style={styles.summaryTable}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryHeader}>Miles</Text>
            <Text style={styles.summaryValue}>{data.total_miles}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryHeader}>Rate</Text>
            <Text style={styles.summaryValue}>{data.miles_rate}</Text>
          </View>
          <View style={styles.summaryColLast}>
            <Text style={styles.summaryHeader}>To pay</Text>
            <Text style={styles.summaryValueRed}>{formatAmount(data.company_driver_pay)}</Text>
          </View>
        </View>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.th, flex: 0.8 }}>Load #</Text>
          <Text style={{ ...styles.th, flex: 2.2 }}>Pickup</Text>
          <Text style={{ ...styles.th, flex: 2.2 }}>Delivery</Text>
          <Text style={{ ...styles.th, flex: 1.2 }}>Loaded Miles</Text>
          <Text style={{ ...styles.thLast, flex: 1.5 }}>Load ID</Text>
        </View>
        {/* Table Rows */}
        {Array.isArray(data.loads_detail) && data.loads_detail.length > 0 && data.loads_detail.map((ld, idx) => (
          <View key={idx} style={idx % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.td, flex: 0.8 }}>{ld.load_number}</Text>
            <Text style={{ ...styles.td, flex: 2.2 }}>{ld.pickup_location}</Text>
            <Text style={{ ...styles.td, flex: 2.2 }}>{ld.delivery_location}</Text>
            <Text style={{ ...styles.td, flex: 1.2 }}>{ld.loaded_miles}</Text>
            <Text style={{ ...styles.tdLast, flex: 1.5 }}>{ld.load_id || ''}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default CompanyDriverPDF;
