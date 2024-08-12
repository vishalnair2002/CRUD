import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:5201/api/students';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  addStudent(student: Student, formData: FormData): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, formData); // Use formData in the request
  }

  updateStudent(student: Student, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${student.id}`, formData); // Use formData in the request
  }

  deleteStudent(id: number | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStudentsPerGrade(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students-per-grade`);
  }

  exportToExcel(students: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(students);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportToPDF(students: any[], fileName: string): void {
    const doc = new jsPDF();
    const columns = ["Name", "Photo", "Phone Number", "Email", "Student ID", "Major Subject", "Year", "Grade"];
    const rows = students.map(student => [
      student.name,
      student.photo,
      student.phone,
      student.email,
      student.studentId,
      student.major,
      student.year,
      student.grade 
    ]);

    (doc as any).autoTable(columns, rows);
    doc.save(`${fileName}_export_${new Date().getTime()}.pdf`);
  }
}
