import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Notiflix from 'notiflix';
import { AuthService } from '../auth.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { from, map, mergeMap, Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  constructor(
    private auth: Auth, 
    private router: Router,
    private authService: AuthService,
    private store: Store
  ) { }

  loginWithGoogle(): Observable<any> {
    return from(
      signInWithPopup(this.auth, new GoogleAuthProvider())
    ).pipe(
      mergeMap(async (result) => {
        const user = result.user;
        const idToken = await user.getIdToken();
  
        return this.authService.loginWithFirebase(
          idToken,
          user.displayName,
          user.email,
          user.photoURL
        ).toPromise();
      }),
      map(response => ({
        success: true,
        user: response.user,
        token: response.token
      }))
    );
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
      Notiflix.Notify.success('Logged out successfully!');
      
    });
  }
}
