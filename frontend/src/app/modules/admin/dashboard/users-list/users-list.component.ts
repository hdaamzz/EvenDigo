import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../../../../core/models/userModel';
import Notiflix from 'notiflix';
import { AdminUsersService } from '../../../../core/services/admin/admin.users.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { style } from '@angular/animations';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, DialogModule, ButtonModule,MenuModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  usersList: User[] = [];
  verificationList: any = [];
  showVerificationPage:boolean=false
  loading = true;
  verificationLoading = true;
  visible: boolean = false;
  position: string = 'right';
  isMobile: boolean = false;
  selectedUser: User = {
    _id: '',
    name: '',
    email: ''
  }
  


  constructor(private userService: AdminUsersService) { }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  fetchUserData() {
    this.loading = true;
    this.userService.usersList().pipe(
      tap((response) => {
        if (response.success) {
          this.usersList = response.data;
        } else {
          console.error('Failed to fetch users:', response.message);
          Notiflix.Notify.failure(response.message);
        }
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        Notiflix.Notify.failure('Error fetching users');
        return of(null);
      }),
      finalize(() => this.loading = false)
    ).subscribe();
  }
  fetchVerificationUserData() {
    this.verificationLoading = true;
    this.userService.verificationUsersList().pipe(
      tap((response) => {
        if (response.success) {
          this.verificationList = response.data;
        } else {
          console.error('Failed to fetch users:', response.message);
          Notiflix.Notify.failure(response.message);
        }
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        Notiflix.Notify.failure('Error fetching users');
        return of(null);
      }),
      finalize(() => this.verificationLoading = false)
    ).subscribe();
  }
  


  ngOnInit(): void {
    this.checkScreenSize();
    this.fetchUserData();
    this.fetchVerificationUserData();
  }


  getInitialColor(name: string): string {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
      'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
      'bg-orange-800', 'bg-cyan-600', 'bg-lime-600', 'bg-emerald-600',
      'bg-rose-600', 'bg-amber-600', 'bg-fuchsia-600', 'bg-violet-600',
    ];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  }

  showDialog(id: string, position: string) {
    this.userService.userDetails(id).subscribe({
      next: (user) => {
        this.selectedUser = user || { _id: '', name: '', email: '' };
        this.position = this.isMobile ? 'bottom' : position;
        this.visible = true;
      },
      error: (error) => {
        console.error('Error showing user dialog:', error);
      },
    });
  }

  hideDialog() {
    this.visible = false;
  }

  blockUser(id: string) {
    this.userService.blockUser(id).subscribe({
      next: () => {
        this.fetchUserData();
        Notiflix.Notify.success('Successfully Blocked');
        this.hideDialog();
      },
      error: (err) => {
        console.error('Error blocking user:', err);
        Notiflix.Notify.failure('User Blocking Failed!');
      },
    });
  }
  unblockUser(id: string) {
    this.userService.unblockUser(id).subscribe({
      next: () => {
        this.fetchUserData();
        Notiflix.Notify.success('Successfully Unblocked');
        this.hideDialog();
      },
      error: (err) => {
        console.error('Error unblocking user:', err);
        Notiflix.Notify.failure('User Unblocking Failed!');
      },
    });
  }

  approveUser(id: string) {
    this.userService.approveUser(id).subscribe({
      next: () => {
        this.fetchUserData();
        this.fetchVerificationUserData();
        Notiflix.Notify.success('Successfully Approved');
        this.hideDialog();
      },
      error: (err) => {
        console.error('Error approved user:', err);
        Notiflix.Notify.failure('User approving Failed!');
      },
    });
  }
  rejectUser(id: string) {
    this.userService.rejectUser(id).subscribe({
      next: () => {
        this.fetchUserData();
        this.fetchVerificationUserData();
        Notiflix.Notify.success('Successfully Rejected');
        this.hideDialog();
      },
      error: (err) => {
        console.error('Error reject user:', err);
        Notiflix.Notify.failure('User rejecting Failed!');
      },
    });
  }
  showVerification(){
    this.showVerificationPage=!this.showVerificationPage;
  }
  getMenuItems(verification: any) {
    const items = [
      {
        label: 'View Details',
        icon: 'pi pi-arrow-up',
        command: () => this.showDialog(verification.user_id._id, 'bottom')
      }
    ];
  
    if (verification.status === 'Pending') {
      items.unshift(
        {
          label: 'Reject',
          icon: 'pi pi-times',
          command: () => {
            this.rejectUser(verification.user_id._id);
          }
        } as any,
        {
          label: 'Approve',
          icon: 'pi pi-check',
          command: () => {
            this.approveUser(verification.user_id._id);
          }
        } as any  
      );
    }
    
    return items;
  }
}
