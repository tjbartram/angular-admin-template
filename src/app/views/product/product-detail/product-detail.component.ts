import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  public productData: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      console.log(data);
      if (data.data) {
        //Loaded record for view / edit
        this.productData = data.data.response.product[0];
      } else {
        //New record
        this.productData = { id: 'null', title: 'New Product' };
      }
    });
  }
}
