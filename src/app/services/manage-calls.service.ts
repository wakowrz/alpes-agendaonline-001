import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ServiceCallerService } from './service-caller.service';
import { UtilService } from './util.service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ManageCallsService {
  constructor(
    /**
     * Call Service
     */
    private serviceCaller: ServiceCallerService,
    /**
     * Spinner Service
     */
    private spinner: NgxSpinnerService,
    /**
     * Util Service
     */
    private utSV: UtilService,

    private http: HttpClient
  ) {}

  /**
   * This resource returns a promise with the answer of GET methos
   * @param serviceUrl URL Services
   * @param object Update Object
   */
  public getData(serviceUrl: string): Promise<any> {
    if (serviceUrl !== undefined && serviceUrl !== null) {
      return this.utSV.returnObservableResponse(
        this.serviceCaller.get(serviceUrl)
      );
    } else {
      return null;
    }
  }

  public getDataByPage(
    serviceUrl: string,
    page?: string,
    pageSize?: string
  ): Promise<any> {
    if (
      page !== undefined &&
      page !== null &&
      pageSize !== undefined &&
      pageSize !== null
    ) {
      return this.utSV.returnObservableResponse(
        this.serviceCaller.getByPage(serviceUrl, page, pageSize)
      );
    } else {
      return this.utSV.returnObservableResponse(
        this.serviceCaller.getByPage(serviceUrl)
      );
    }
  }

  public postData(serviceUrl: string, object: any): Promise<any> {
    if (serviceUrl !== undefined && serviceUrl !== null) {
      return this.utSV.returnObservableResponse(
        this.serviceCaller.post(serviceUrl, object)
      );
    } else {
      return null;
    }
  }
  public postDataSubscriber(serviceUrl: string, object: any) {
    return this.http.post(serviceUrl, object);
  }

  public postDataByManaginUi(serviceUrl: string, object: any): Promise<any> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      const prom = this.postData(serviceUrl, object);
      if (prom == null) {
        reject();
        this.spinner.hide();
        return;
      }
    });
  }

  public putData(serviceUrl: string, object: any): Promise<any> {
    if (serviceUrl !== undefined && serviceUrl !== null) {
      return this.utSV.returnObservableResponse(
        this.serviceCaller.put(serviceUrl, object)
      );
    } else {
      return null;
    }
  }
}
