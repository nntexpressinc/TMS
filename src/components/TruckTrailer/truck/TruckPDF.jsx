import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const TruckPDF = ({ truck }) => {
  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Make', value: truck?.make },
        { label: 'Model', value: truck?.model },
        { label: 'Unit Number', value: truck?.unit_number },
        { label: 'VIN', value: truck?.vin },
        { label: 'Year', value: truck?.year },
        { label: 'State', value: truck?.state },
      ]
    },
    {
      title: 'Registration & Inspection',
      fields: [
        { label: 'Registration Expiry', value: formatDate(truck?.registration_expiry_date) },
        { label: 'Last Annual Inspection', value: formatDate(truck?.last_annual_inspection_date) },
        { label: 'Plate Number', value: truck?.plate_number },
      ]
    },
    {
      title: 'Specifications',
      fields: [
        { label: 'Weight', value: truck?.weight },
        { label: 'Color', value: truck?.color },
        { label: 'MC Number', value: truck?.mc_number },
      ]
    },
    {
      title: 'Integration Details',
      fields: [
        { label: 'Integration ELD', value: truck?.integration_eld },
        { label: 'Integration ID', value: truck?.integration_id },
        { label: 'Integration API', value: truck?.integration_api },
      ]
    },
    {
      title: 'Assignment Information',
      fields: [
        { label: 'Status', value: truck?.assignment_status },
        { label: 'Driver', value: truck?.driver },
        { label: 'Co-Driver', value: truck?.co_driver },
        { label: 'Location', value: truck?.location },
      ]
    },
    {
      title: 'Trip Details',
      fields: [
        { label: 'Pickup Date', value: formatDate(truck?.pickup_date) },
        { label: 'Drop Date', value: formatDate(truck?.drop_date) },
        { label: 'Mileage on Pickup', value: truck?.mileage_on_pickup },
        { label: 'Mileage on Drop', value: truck?.mileage_on_drop },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { label: 'Notes', value: truck?.notes },
        { label: 'Comment', value: truck?.comment },
      ]
    }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Truck Details</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.fields.map((field, fieldIndex) => (
              <View key={fieldIndex} style={styles.row}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{field.value || 'N/A'}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default TruckPDF; 