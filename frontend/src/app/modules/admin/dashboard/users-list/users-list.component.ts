import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import Notiflix from 'notiflix';

import { User } from '../../../../core/models/userModel';
import { AdminCardComponent } from '../../../../shared/admin-card/admin-card.component';
import { AdminUsersService } from '../../../../core/services/admin/users/admin.users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, MenuModule, AdminCardComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, OnDestroy {
  
  usersList: User[] = [];
  filteredUsersList: User[] = [];
  verificationList: any[] = [];
  filteredVerificationList: any[] = [];
  showVerificationPage = false;
  loading = true;
  verificationLoading = true;
  visible = false;
  position = 'right';
  isMobile = false;
  
  // Search properties
  usersSearchTerm = '';
  verificationSearchTerm = '';
  
  selectedUser: User = {
    _id: '',
    name: '',
    email: ''
  };

  
  private readonly _destroy$ = new Subject<void>();
  private readonly _colors = [
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
    'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
    'bg-orange-800', 'bg-cyan-600', 'bg-lime-600', 'bg-emerald-600',
    'bg-rose-600', 'bg-amber-600', 'bg-fuchsia-600', 'bg-violet-600',
  ];

  constructor(private _usersService: AdminUsersService) {}

  @HostListener('window:resize')
  onResize(): void {
    this._checkScreenSize();
  }

  ngOnInit(): void {
    this._checkScreenSize();
    this._fetchUserData();
    this._fetchVerificationUserData();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // Search methods
  onUsersSearchChange(searchValue: string): void {
    this.usersSearchTerm = searchValue;
    this._filterUsers();
  }

  onUsersSearchClear(): void {
    this.usersSearchTerm = '';
    this.filteredUsersList = [...this.usersList];
  }

  onVerificationSearchChange(searchValue: string): void {
    this.verificationSearchTerm = searchValue;
    this._filterVerificationUsers();
  }

  onVerificationSearchClear(): void {
    this.verificationSearchTerm = '';
    this.filteredVerificationList = [...this.verificationList];
  }

  private _filterUsers(): void {
    if (!this.usersSearchTerm) {
      this.filteredUsersList = [...this.usersList];
      return;
    }

    const searchTerm = this.usersSearchTerm.toLowerCase();
    this.filteredUsersList = this.usersList.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.status && user.status.toLowerCase().includes(searchTerm))
    );
  }

  private _filterVerificationUsers(): void {
    if (!this.verificationSearchTerm) {
      this.filteredVerificationList = [...this.verificationList];
      return;
    }

    const searchTerm = this.verificationSearchTerm.toLowerCase();
    this.filteredVerificationList = this.verificationList.filter(verification => 
      verification.user_id.name.toLowerCase().includes(searchTerm) ||
      verification.user_id.email.toLowerCase().includes(searchTerm) ||
      (verification.user_id.phone && verification.user_id.phone.includes(searchTerm)) ||
      (verification.status && verification.status.toLowerCase().includes(searchTerm))
    );
  }
  
  showDialog(id: string, position: string): void {
    this._usersService.userDetails(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (user) => {
          this.selectedUser = user || { _id: '', name: '', email: '' };
          this.position = this.isMobile ? 'bottom' : position;
          this.visible = true;
        },
        error: (error) => {
          console.error('Error showing user dialog:', error);
          Notiflix.Notify.failure('Could not load user details');
        },
      });
  }

  hideDialog(): void {
    this.visible = false;
  }

  blockUser(id: string): void {
    this._usersService.blockUser(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._fetchUserData();
          Notiflix.Notify.success('Successfully Blocked');
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error blocking user:', err);
          Notiflix.Notify.failure('User Blocking Failed!');
        },
      });
  }

  unblockUser(id: string): void {
    this._usersService.unblockUser(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._fetchUserData();
          Notiflix.Notify.success('Successfully Unblocked');
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error unblocking user:', err);
          Notiflix.Notify.failure('User Unblocking Failed!');
        },
      });
  }

  approveUser(id: string): void {
    this._usersService.approveUser(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._fetchUserData();
          this._fetchVerificationUserData();
          Notiflix.Notify.success('Successfully Approved');
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error approving user:', err);
          Notiflix.Notify.failure('User approving Failed!');
        },
      });
  }

  rejectUser(id: string): void {
    this._usersService.rejectUser(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._fetchUserData();
          this._fetchVerificationUserData();
          Notiflix.Notify.success('Successfully Rejected');
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error rejecting user:', err);
          Notiflix.Notify.failure('User rejecting Failed!');
        },
      });
  }

  showVerification(): void {
    this.showVerificationPage = !this.showVerificationPage;
  }

  getInitialColor(name: string): string {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this._colors[sum % this._colors.length];
  }

  getMenuItems(verification: any): MenuItem[] {
    const items: MenuItem[] = [
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
          command: () => this.rejectUser(verification.user_id._id)
        },
        {
          label: 'Approve',
          icon: 'pi pi-check',
          command: () => this.approveUser(verification.user_id._id)
        }
      );
    }
    
    return items;
  }

  getUserStatusBadge(user: User): { text: string, classes: string } {
    switch (user.status) {
      case 'active':
        return { text: 'Active', classes: 'bg-green-100 text-green-600' };
      case 'deactive':
        return { text: 'Deactive', classes: 'bg-yellow-100 text-yellow-600' };
      default:
        return { text: 'Blocked', classes: 'bg-red-100 text-red-600' };
    }
  }
  
  getUserMenuItems(user: User): MenuItem[] {
    return [
      {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.showDialog(user._id, this.isMobile ? 'bottom' : 'right')
      },
      {
        label: user.status === 'active' ? 'Block User' : 'Unblock User',
        icon: user.status === 'active' ? 'pi pi-lock' : 'pi pi-unlock',
        command: () => user.status === 'active' ? this.blockUser(user._id) : this.unblockUser(user._id)
      }
    ];
  }

  // Private methods
  private _checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  private _fetchUserData(): void {
    this.loading = true;
    this._usersService.usersList()
      .pipe(
        takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Error fetching users:', error);
          Notiflix.Notify.failure('Error fetching users');
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        if (response?.success) {
          this.usersList = response.data;
          this.filteredUsersList = [...this.usersList];
        } else if (response) {
          console.error('Failed to fetch users:', response.message);
          Notiflix.Notify.failure(response.message);
        }
      });
  }

  private _fetchVerificationUserData(): void {
    this.verificationLoading = true;
    this._usersService.verificationUsersList()
      .pipe(
        takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Error fetching verification users:', error);
          Notiflix.Notify.failure('Error fetching verification users');
          return of(null);
        }),
        finalize(() => this.verificationLoading = false)
      )
      .subscribe(response => {
        if (response?.success) {
          this.verificationList = response.data;
          this.filteredVerificationList = [...this.verificationList];
        } else if (response) {
          console.error('Failed to fetch verification users:', response.message);
          Notiflix.Notify.failure(response.message);
        }
      });
  }
}