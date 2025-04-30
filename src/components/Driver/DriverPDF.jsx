import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: 5,
  },
  tableCell: {
    flex: 1,
    padding: 3,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const getProfilePhoto = (url) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (url.startsWith('http')) return url;
  return `https://api1.biznes-armiya.uz${url}`;
};

const DriverPDF = ({ driver, user, payments, expenses }) => {
  const userInfo = user || driver?.user || {};
  const userSection = [
    { label: 'Email', value: userInfo.email },
    { label: 'Company Name', value: userInfo.company_name },
    { label: 'First Name', value: userInfo.first_name },
    { label: 'Last Name', value: userInfo.last_name },
    { label: 'Phone', value: userInfo.telephone },
    { label: 'City', value: userInfo.city },
    { label: 'Address', value: userInfo.address },
    { label: 'Country', value: userInfo.country },
    { label: 'State', value: userInfo.state },
    { label: 'Postal/Zip', value: userInfo.postal_zip },
  ];

  const driverSection = [
    { label: 'Birth Date', value: formatDate(driver?.birth_date) },
    { label: 'Employment Status', value: driver?.employment_status },
    { label: 'Telegram', value: driver?.telegram_username },
    { label: 'Driver Status', value: driver?.driver_status },
    { label: 'Driver License ID', value: driver?.driver_license_id },
    { label: 'DL Class', value: driver?.dl_class },
    { label: 'Driver Type', value: driver?.driver_type },
    { label: 'License State', value: driver?.driver_license_state },
    { label: 'License Expiration', value: formatDate(driver?.driver_license_expiration) },
    { label: 'Other ID', value: driver?.other_id },
    { label: 'Notes', value: driver?.notes },
    { label: 'Tariff', value: driver?.tariff },
    { label: 'MC Number', value: driver?.mc_number },
    { label: 'Team Driver', value: driver?.team_driver },
    { label: 'Per Mile', value: driver?.permile },
    { label: 'Cost', value: driver?.cost },
    { label: 'Payd', value: driver?.payd },
    { label: 'Escrow Deposit', value: driver?.escrow_deposit },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Driver Details</Text>
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Image src={getProfilePhoto(userInfo?.profile_photo)} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 5 }} />
            <Text>{userInfo?.first_name || userInfo?.email || '-'}</Text>
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          {userSection.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          {driverSection.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Type</Text>
            <Text style={styles.tableCell}>Currency</Text>
            <Text style={styles.tableCell}>Standard</Text>
            <Text style={styles.tableCell}>Additional Charges</Text>
            <Text style={styles.tableCell}>Picks Per</Text>
            <Text style={styles.tableCell}>Drops Per</Text>
            <Text style={styles.tableCell}>Wait Time</Text>
          </View>
          {payments && payments.length > 0 ? payments.map((pay, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{pay.pay_type || '-'}</Text>
              <Text style={styles.tableCell}>{pay.currency || '-'}</Text>
              <Text style={styles.tableCell}>{pay.standart || '-'}</Text>
              <Text style={styles.tableCell}>{pay.additional_charges || '-'}</Text>
              <Text style={styles.tableCell}>{pay.picks_per || '-'}</Text>
              <Text style={styles.tableCell}>{pay.drops_per || '-'}</Text>
              <Text style={styles.tableCell}>{pay.wait_time || '-'}</Text>
            </View>
          )) : (
            <Text>No payments found.</Text>
          )}
        </View>

        {/* Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Amount</Text>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Created At</Text>
          </View>
          {expenses && expenses.length > 0 ? expenses.map((exp, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{exp.description || '-'}</Text>
              <Text style={styles.tableCell}>{exp.amount || '-'}</Text>
              <Text style={styles.tableCell}>{formatDate(exp.expense_date)}</Text>
              <Text style={styles.tableCell}>{formatDate(exp.created_at)}</Text>
            </View>
          )) : (
            <Text>No expenses found.</Text>
          )}
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default DriverPDF; 