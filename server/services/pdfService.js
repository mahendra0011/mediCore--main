import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const HOSPITAL_NAME = 'MediCore Hospital';
const HOSPITAL_ADDRESS = '123 Medical Center Drive, Healthcare City';
const HOSPITAL_PHONE = '+1 (555) 123-4567';
const HOSPITAL_EMAIL = 'info@medicorehospital.com';

const createHeader = (doc, data) => {
  doc.fontSize(20).font('Helvetica-Bold').text(HOSPITAL_NAME, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(HOSPITAL_ADDRESS, { align: 'center' });
  doc.text(`${HOSPITAL_PHONE} | ${HOSPITAL_EMAIL}`, { align: 'center' });
  doc.moveDown();
};

const createPatientInfo = (doc, patient) => {
  if (!patient) return;
  doc.fontSize(11).font('Helvetica-Bold').text('Patient Information:', { continued: false });
  doc.font('Helvetica').text(`Name: ${patient.name || 'N/A'}`);
  doc.text(`Age: ${patient.age || 'N/A'} | Gender: ${patient.gender || 'N/A'}`);
  doc.text(`Phone: ${patient.phone || 'N/A'} | Email: ${patient.email || 'N/A'}`);
  if (patient.address) doc.text(`Address: ${patient.address}`);
  doc.moveDown();
};

const createDoctorInfo = (doc, doctor) => {
  if (!doctor) return;
  doc.fontSize(11).font('Helvetica-Bold').text('Doctor Information:', { continued: false });
  doc.font('Helvetica').text(`Dr. ${doctor.name || 'N/A'}`);
  doc.text(`Specialization: ${doctor.specialization || 'N/A'}`);
  doc.moveDown();
};

const createFooter = (doc) => {
  doc.moveDown(3);
  doc.fontSize(9).font('Helvetica');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.text('This is a computer-generated document. No signature required.', { align: 'center' });
};

export const generatePrescriptionPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      createHeader(doc, data);
      
      if (data.patient) createPatientInfo(doc, data.patient);
      if (data.doctor) createDoctorInfo(doc, data.doctor);

      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Chief Complaints:');
      doc.font('Helvetica').text(data.chiefComplaints || 'Not specified');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Diagnosis:');
      doc.font('Helvetica').text(data.diagnosis || 'Not specified');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Medications:');
      if (data.medications && Array.isArray(data.medications) && data.medications.length > 0) {
        data.medications.forEach((med, index) => {
          if (med && med.name) {
            doc.font('Helvetica').text(`${index + 1}. ${med.name} - ${med.dosage || ''} (${med.frequency || ''})`);
            if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
          }
        });
      } else {
        doc.font('Helvetica').text('No medications prescribed');
      }
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Advice:');
      doc.font('Helvetica').text(data.advice || 'No specific advice');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Follow-up:');
      doc.font('Helvetica').text(data.followUp || 'Not specified');
      
      createFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateLabReportPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      createHeader(doc, data);
      
      if (data.patient) createPatientInfo(doc, data.patient);
      if (data.doctor) createDoctorInfo(doc, data.doctor);

      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text('LABORATORY REPORT', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text(`Report ID: ${data.reportId || 'N/A'}`);
      doc.text(`Test Date: ${data.testDate || 'N/A'}`);
      doc.text(`Report Date: ${data.reportDate || new Date().toLocaleDateString()}`);
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Test Results:');
      doc.moveDown();
      
      if (data.tests && Array.isArray(data.tests) && data.tests.length > 0) {
        doc.font('Helvetica');
        data.tests.forEach(test => {
          if (test && test.name) {
            doc.text(`${test.name || ''}: ${test.result || ''} ${test.unit || ''} (Ref: ${test.referenceRange || 'N/A'})`);
          }
        });
      }
      doc.moveDown();
      
      if (data.notes) {
        doc.fontSize(11).font('Helvetica-Bold').text('Notes:');
        doc.font('Helvetica').text(data.notes);
      }
      
      createFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateDischargeSummaryPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      createHeader(doc, data);
      
      if (data.patient) createPatientInfo(doc, data.patient);
      if (data.doctor) createDoctorInfo(doc, data.doctor);

      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text('DISCHARGE SUMMARY', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text(`Admission Date: ${data.admissionDate || 'N/A'}`);
      doc.text(`Discharge Date: ${data.dischargeDate || 'N/A'}`);
      doc.text(`Admission ID: ${data.admissionId || 'N/A'}`);
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Chief Complaints on Admission:');
      doc.font('Helvetica').text(data.chiefComplaints || 'Not specified');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Diagnosis:');
      doc.font('Helvetica').text(data.diagnosis || 'Not specified');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Treatment Given:');
      doc.font('Helvetica').text(data.treatment || 'Not specified');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Surgery/Procedure (if any):');
      doc.font('Helvetica').text(data.surgery || 'None');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Discharge Medications:');
      if (data.medications && Array.isArray(data.medications) && data.medications.length > 0) {
        data.medications.forEach((med, index) => {
          if (med && med.name) {
            doc.font('Helvetica').text(`${index + 1}. ${med.name} - ${med.dosage || ''} (${med.frequency || ''})`);
          }
        });
      }
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Discharge Advice:');
      doc.font('Helvetica').text(data.dischargeAdvice || 'No specific advice');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica-Bold').text('Follow-up Instructions:');
      doc.font('Helvetica').text(data.followUpInstructions || 'Not specified');
      
      createFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
