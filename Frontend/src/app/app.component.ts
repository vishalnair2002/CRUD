import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from './student.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Student {
  id: any;
  name: string;
  photo: string;
  phone: string;
  email: string;
  studentId: string;
  major: string;
  year: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ReactiveFormsModule,FormsModule,CommonModule],  
  standalone: true
  
})
export class AppComponent implements OnInit {
  title = 'student-frontend';
  studentForm: FormGroup;
  students: Student[] = [];
  editedStudent: Student | null = null;
barChartData: any;
barChartLabels: any;
barChartOptions: any;
barChartLegend: any;
barChartType: any;

  constructor(private formBuilder: FormBuilder, private studentService: StudentService) {
    this.studentForm = this.formBuilder.group({
      name: ['', Validators.required],
      photo: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      studentId: ['', Validators.required],
      major: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students;
    });
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.students);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const col = ['Name', 'Photo', 'Phone', 'Email', 'Student ID', 'Major', 'Year'];
    const rows: (string | number)[][] = [];

    this.students.forEach(student => {
      const temp = [
        student.name,
        student.photo,
        student.phone,
        student.email,
        student.studentId,
        student.major,
        student.year
      ];
      rows.push(temp);
    });

    doc.autoTable(col, rows);
  doc.save('students.pdf');
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      console.error('Form is invalid', this.studentForm.errors);
      return;
    }

    const formData = this.studentForm.value;
    const student: Student = {
      id: this.editedStudent ? this.editedStudent.id : null,
      ...formData
    };

    console.log(`${this.editedStudent ? 'Updating' : 'Adding'} student:`, student);

    const request = this.editedStudent ?
      this.studentService.updateStudent(student) :
      this.studentService.addStudent(student);

    request.subscribe(
      () => this.loadStudents(),
      error => console.error(`Error ${this.editedStudent ? 'updating' : 'adding'} student:`, error)
    );

    this.editedStudent = null;
    this.studentForm.reset();
  }

  editStudent(student: Student) {
    this.editedStudent = student;
    this.studentForm.patchValue({
      name: student.name,
      phone: student.phone,
      email: student.email,
      studentId: student.studentId,
      major: student.major,
      year: student.year
    });
  }

  cancelEdit() {
    this.editedStudent = null;
    this.studentForm.reset();
  }

  deleteStudent(student: Student) {
    const studentIdToDelete = student.id;
    if (confirm("Are you sure you want to delete this student?")) {
      this.studentService.deleteStudent(studentIdToDelete).subscribe(() => {
        this.students = this.students.filter(s => s.id !== studentIdToDelete);
      });
    }
  }
}