import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {retry, catchError} from  'rxjs/operators';
import {Observable} from 'rxjs'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  api: any;

  httpOptions = {
    headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin' :'*'
    })
    }

  apiURL = 'https://jsonplaceholder.typicode.com';

  constructor(private http:HttpClient) {
    
  }
  
  getPosts():Observable<any>{
    return this.http.get(this.apiURL+'/posts/').pipe(retry(3));
    }
  
    createPost(post):Observable<any>{
      return
      this.http.post(this.apiURL+'/posts',post,this.httpOptions).pipe(retry(3));
      }   
      
    updatePost(id,post):Observable<any>{
    return
    this.http.put(this.apiURL+'/posts/'+id,post,this.httpOptions).pipe(retry(3));
    }
  
    deletePost(id):Observable<any>{
      return
      this.http.delete(this.apiURL+'/posts/'+id,this.httpOptions);
      }

}
