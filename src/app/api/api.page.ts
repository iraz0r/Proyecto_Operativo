import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.page.html',
  styleUrls: ['./api.page.scss'],
})
export class ApiPage implements OnInit {
  cama
  constructor(private api: ApiService) { 
    this.api.getPosts();
    this.api.getPosts().subscribe((res) =>{
    this.cama=res;
    console.log(res);
  },(error) => {
    console.log(error);
  });
  }

  ngOnInit() {
  }

}
