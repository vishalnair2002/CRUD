import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from './student.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

interface Student {
  id: any;
  name: string;
  photo: File;
  phone: string;
  email: string;
  studentId: string;
  major: string;
  year: number;
  grade: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  standalone: true 
})

export class AppComponent implements OnInit {
  title = 'student-frontend';
  studentForm: FormGroup;
  students: Student[] = [];
  editedStudent: Student | null = null;
  selectedFile: File | null = null;

  studentCountPerGrade: { [grade: string]: number } = {};
gradeCounts: ReadonlyMap<unknown, unknown> | undefined;

  constructor(private formBuilder: FormBuilder, private studentService: StudentService) {
    this.studentForm = this.formBuilder.group({
      name: ['', Validators.required],
      photo: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      studentId: ['', Validators.required],
      major: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      grade: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students as Student[];
      this.calculateStudentCountPerGrade();
    });
  }

  calculateStudentCountPerGrade() {
    this.studentCountPerGrade = this.students.reduce((acc, student) => {
      const grade = student.grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as { [grade: string]: number });
  }

  getGrades(): string[] {
    return Object.keys(this.studentCountPerGrade);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
        console.error('Form is invalid', this.studentForm.errors);
        return;
    }

    const student: Student = {
        id: this.editedStudent ? this.editedStudent.id : null,
        name: this.studentForm.get('name')?.value,
        photo: this.selectedFile ?? new File([], ''),
        phone: this.studentForm.get('phone')?.value,
        email: this.studentForm.get('email')?.value,
        studentId: this.studentForm.get('studentId')?.value,
        major: this.studentForm.get('major')?.value,
        year: this.studentForm.get('year')?.value,
        grade: this.studentForm.get('grade')?.value
    };

    const formData = new FormData();
    formData.append('name', student.name);
    if (student.photo) {
        formData.append('photo', student.photo);
    }
    formData.append('phone', student.phone);
    formData.append('email', student.email);
    formData.append('studentId', student.studentId);
    formData.append('major', student.major);
    formData.append('year', student.year.toString());
    formData.append('grade', student.grade);

    const request: Observable<void | Student> = this.editedStudent ?
    this.studentService.updateStudent(student, formData) as Observable<void> :
    this.studentService.addStudent(student, formData) as Observable<Student>;

    request.subscribe(
        () => {
            this.loadStudents();
            this.calculateStudentCountPerGrade();
        },
        (error: Error) => console.error(`Error ${this.editedStudent ? 'updating' : 'adding'} student:`, error)
    );
    this.editedStudent = null;
    this.selectedFile = null;  // Reset the selected file
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
      year: student.year,
      grade: student.grade
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
        this.calculateStudentCountPerGrade();
      });
    }
  }

  exportToExcel(): void {
    this.studentService.exportToExcel(this.students, 'students');
  }

  exportToPDF(): void {
    this.studentService.exportToPDF(this.students, 'students');
  }
}
