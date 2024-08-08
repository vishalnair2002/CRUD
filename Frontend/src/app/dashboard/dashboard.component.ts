import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Number of Students',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    }
  };
barChartData: any;
barChartType: any;
barChartLegend: any;
barChartOptions: any;
barChartLabels: any;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudentGrades();
  }

  loadStudentGrades(): void {
    this.studentService.getStudents().subscribe(students => {
      const gradesCount = students.reduce((acc: {[key: number]: number}, student) => {
        acc[student.year] = (acc[student.year] || 0) + 1;
        return acc;
      }, {});
  
      this.chartData.labels = Object.keys(gradesCount);
      this.chartData.datasets[0].data = Object.values(gradesCount);
    });
  }
}
