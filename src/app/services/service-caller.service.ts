import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceCallerService {
  private httpHeaders = {
    Authorization: '',

    Accept: 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Headers': 'content-type, authorization, accept',
    'Access-Control-Allow-Methods': '',
  };

  constructor(private http: HttpClient) {}

  /* --- GET --- */
  public get(url: string): Observable<object> {
    this.httpHeaders['Access-Control-Allow-Methods'] = 'POST';
    return this.http.get(url, { headers: new HttpHeaders(this.httpHeaders) });
  }

  /* --- GET with pagination --- */
  public getByPage(
    url: string,
    page = '0',
    pageSize = '0'
  ): Observable<object> {
    this.httpHeaders['Access-Control-Allow-Methods'] = 'POST';
    const header = {
      headers: new HttpHeaders(this.httpHeaders),
      params: new HttpParams().set('page', page).set('pageSize', pageSize), // Request Param
    };
    return this.http.get(url, header);
  }

  /*--- POST method---*/
  public post(url: string, data: any): Observable<object> {
    this.httpHeaders['Access-Control-Allow-Methods'] = 'POST';
    return this.http.post(url, data, {
      headers: new HttpHeaders(this.httpHeaders),
    });
  }

  /*--- PUT method---*/
  public put(url: string, data: any): Observable<object> {
    this.httpHeaders['Access-Control-Allow-Methods'] = 'PUT';
    return this.http.put(url, data, {
      headers: new HttpHeaders(this.httpHeaders),
    });
  }
}
