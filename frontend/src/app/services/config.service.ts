import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = `${environment.apiUrl}/api/config`;

  constructor(private http: HttpClient) {}

  getSubjectsConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subjects`);
  }

  getSaudiSubjectsConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subjects-saudi`);
  }
}
