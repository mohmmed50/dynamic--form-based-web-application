import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StudentCreateDto, StudentResponseDto, ApiResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  registerStudent(payload: StudentCreateDto): Observable<ApiResponse<StudentResponseDto>> {
    return this.http.post<ApiResponse<StudentResponseDto>>(`${this.apiUrl}/register`, payload);
  }

  getStudentById(id: number): Observable<ApiResponse<StudentResponseDto>> {
    return this.http.get<ApiResponse<StudentResponseDto>>(`${this.apiUrl}/${id}`);
  }

  getStudentByNationalId(nationalId: string): Observable<ApiResponse<StudentResponseDto>> {
    return this.http.get<ApiResponse<StudentResponseDto>>(`${this.apiUrl}/nationalId/${nationalId}`);
  }

  getAllStudents(): Observable<ApiResponse<StudentResponseDto[]>> {
    return this.http.get<ApiResponse<StudentResponseDto[]>>(this.apiUrl);
  }
}
