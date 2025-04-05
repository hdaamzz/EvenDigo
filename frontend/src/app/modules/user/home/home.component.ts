import { Component } from '@angular/core';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/userModel';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-home',
  imports: [UserFooterComponent,UserNavComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    private store: Store
  ){
    // this.store.select(selectUser).subscribe(user => {
    //   console.log('Current User:', user);
    // });
  }

  
}
