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

const getProfilePhoto = (url) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (url.startsWith('http')) return url;
  return `https://api1.biznes-armiya.uz${url}`;
};

const EmployeePDF = ({ employee, user }) => {
  const userSection = [
    { label: 'Email', value: user?.email },
    { label: 'Company Name', value: user?.company_name },
    { label: 'First Name', value: user?.first_name },
    { label: 'Last Name', value: user?.last_name },
    { label: 'Phone', value: user?.telephone },
    { label: 'City', value: user?.city },
    { label: 'Address', value: user?.address },
    { label: 'Country', value: user?.country },
    { label: 'State', value: user?.state },
    { label: 'Postal/Zip', value: user?.postal_zip },
    { label: 'Ext', value: user?.ext },
    { label: 'Fax', value: user?.fax },
    { label: 'Role', value: user?.role },
    { label: 'Company', value: user?.company },
  ];
  const employeeSection = [
    { label: 'Nickname', value: employee?.nickname },
    { label: 'Employee Status', value: employee?.employee_status },
    { label: 'Position', value: employee?.position },
    { label: 'Note', value: employee?.note },
    { label: 'Employee Tags', value: employee?.employee_tags },
    { label: 'Contact Number', value: employee?.contact_number },
  ];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Employee Details</Text>
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Image src={getProfilePhoto(user?.profile_photo)} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 5 }} />
            <Text>{user?.first_name || user?.email || '-'}</Text>
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
        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          {employeeSection.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value || 'N/A'}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default EmployeePDF; 