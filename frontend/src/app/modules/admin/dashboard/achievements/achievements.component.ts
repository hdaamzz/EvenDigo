import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Notiflix from 'notiflix';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { IAchievement } from '../../../../core/models/admin/achievements.interface';
import { debounceTime, filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { AdminAchievementService } from '../../../../core/services/admin/achievements/admin-achievement.service';
import { positiveNumberValidator, thresholdRangeValidator, titleValidator } from '../../../../validators/formValidators';
import { MenuItem } from 'primeng/api';
import { AdminCardComponent } from "../../../../shared/admin-card/admin-card.component";


@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule, 
    ButtonModule, 
    MenuModule, 
    InputTextModule, 
    FormsModule, 
    ReactiveFormsModule, 
    SelectModule, 
    CheckboxModule, 
    AdminCardComponent, 
    MultiSelectModule
  ],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.css'
})
export class AchievementsComponent implements OnInit, OnDestroy, AfterViewInit {
  achievementsList: IAchievement[] = [];
  filteredAchievementsList: IAchievement[] = [];
  loading = false;
  achievementDialogVisible = false;
  selectedAchievement: IAchievement = {
    title: '',
    description: '',
    category: '',
    criteria: '',
    threshold: 0,
    icon: '',
    isActive: false
  };
  isMobile = window.innerWidth < 768;
  createDialogVisible = false;
  
  currentPage = 1;
  pageSize = 9; 
  hasMoreAchievements = true;
  allLoaded = false;
  
  private readonly _destroy$ = new Subject<void>();
  
  @ViewChild('achievementsContainer') achievementsContainer?: ElementRef;  
  achievementForm: FormGroup;
  filterForm: FormGroup;
  
  readonly categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Event', value: 'event' },
    { label: 'User', value: 'user' },
    { label: 'Engagement', value: 'engagement' },
    { label: 'Other', value: 'other' }
  ];
  
  readonly iconOptions = [
    { label: 'Trophy', value: 'fas fa-trophy' },
    { label: 'Medal', value: 'fas fa-medal' },
    { label: 'Star', value: 'fas fa-star' },
    { label: 'Award', value: 'fas fa-award' },
    { label: 'Crown', value: 'fas fa-crown' },
    { label: 'Badge', value: 'fas fa-badge' },
    { label: 'Check', value: 'fas fa-check-circle' }
  ];

  readonly criteriaOptions = [
    { label: 'All Criteria', value: null },
    { label: 'Events Attended', value: 'events_attended' },
    { label: 'Events Created', value: 'events_created' },
    { label: 'VIP Events Taker', value: 'vip_events_taker' },
    { label: 'Gold Events Taker', value: 'gold_events_taker' }
  ];

  readonly statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _achievementService: AdminAchievementService
  ) {
    this.achievementForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), titleValidator()]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['', Validators.required],
      criteria: ['', [Validators.required, Validators.maxLength(100)]],
      threshold: [null, [
        Validators.required, 
        positiveNumberValidator(), 
        thresholdRangeValidator(1, 10000)
      ]],
      icon: ['', Validators.required],
      isActive: [true]
    });

    this.filterForm = this._fb.group({
      category: [null],
      criteria: [null],
      status: [null]
    });
  }
  
  ngOnInit(): void {
    this.loadAchievements(true);
    
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(200)
      )
      .subscribe(() => {
        this.isMobile = window.innerWidth < 768;
      });

    this.filterForm.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(300)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }
  
  ngAfterViewInit(): void {
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(200),
        filter(() => !this.loading && this.hasMoreAchievements)
      )
      .subscribe(() => {
        if (this._isScrolledToBottom()) {
          this.loadMoreAchievements();
        }
      });
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  private _isScrolledToBottom(): boolean {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    return (scrollPosition + windowHeight) > (documentHeight * 0.8);
  }

  loadAchievements(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 1;
      this.achievementsList = [];
      this.filteredAchievementsList = [];
      this.hasMoreAchievements = true;
      this.allLoaded = false;
    }
    
    if (this.loading || this.allLoaded) return;
    
    this.loading = true;
    this._achievementService.getAchievementsWithPagination(this.currentPage, this.pageSize)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          const newAchievements = response.data.map(achievement => ({
            _id: achievement._id,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            criteria: achievement.criteria,
            threshold: achievement.threshold,
            icon: achievement.icon,
            isActive: achievement.isActive,
            createdAt: achievement.createdAt ? new Date(achievement.createdAt) : null,
            updatedAt: achievement.updatedAt ? new Date(achievement.updatedAt) : null
          }));
          
          this.achievementsList = reset ? newAchievements : [...this.achievementsList, ...newAchievements];
          this.applyFilters();
          
          this.hasMoreAchievements = response.pagination?.hasMore || false;
          if (!this.hasMoreAchievements) {
            this.allLoaded = true;
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading achievements:', err);
          this.loading = false;
          Notiflix.Notify.failure('Failed to load achievements');
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredAchievementsList = this.achievementsList.filter(achievement => {
      const categoryMatch = filters.category === null || achievement.category === filters.category;
      const criteriaMatch = filters.criteria === null || achievement.criteria === filters.criteria;
      const statusMatch = filters.status === null || achievement.isActive === filters.status;
      
      return categoryMatch && criteriaMatch && statusMatch;
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      category: null,
      criteria: null,
      status: null
    });
    this.applyFilters();
  }

  getCriteriaLabel(value: string): string {
    const criteria = this.criteriaOptions.find(option => option.value === value);
    return criteria ? criteria.label : value;
  }
  

  loadMoreAchievements(): void {
    if (this.loading || !this.hasMoreAchievements) return;
    
    this.currentPage++;
    this.loadAchievements();
  }

  showAchievementDetails(achievementId: string): void {
    this.selectedAchievement = this.achievementsList.find(achievement => achievement._id === achievementId) || {
      title: '',
      description: '',
      category: '',
      criteria: '',
      threshold: 0,
      icon: '',
      isActive: false
    };
    this.achievementDialogVisible = true;
  }

  hideAchievementDialog(): void {
    this.achievementDialogVisible = false;
  }

  addNewAchievement(): void {
    this.selectedAchievement = {
      title: '',
      description: '',
      category: '',
      criteria: '',
      threshold: 0,
      icon: '',
      isActive: false
    };
    this.achievementForm.reset();
    this.achievementForm.patchValue({ isActive: true });
    this.achievementForm.markAsPristine();
    this.achievementForm.markAsUntouched();
    this.createDialogVisible = true;
  }

  saveAchievement(): void {
    if (this.achievementForm.invalid) {
      this.achievementForm.markAllAsTouched();
      
      const firstInvalidControl = document.querySelector('.ng-invalid');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
  
    const achievementData: IAchievement = {
      title: this.achievementForm.value.title,
      description: this.achievementForm.value.description,
      category: this.achievementForm.value.category,
      criteria: this.achievementForm.value.criteria,
      threshold: parseInt(this.achievementForm.value.threshold, 10),
      icon: this.achievementForm.value.icon,
      isActive: this.achievementForm.value.isActive
    };

    if (this.selectedAchievement._id) {
      this._updateExistingAchievement(this.selectedAchievement._id, achievementData);
    } else {
      this._createNewAchievement(achievementData);
    }
  }

  private _updateExistingAchievement(achievementId: string, achievementData: IAchievement): void {
    this._achievementService.updateAchievement(achievementId, achievementData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.loadAchievements(true); 
          Notiflix.Notify.success('Achievement Updated Successfully');
          this.achievementDialogVisible = false;
          this.createDialogVisible = false;
        },
        error: (err) => {
          console.error('Error updating achievement:', err);
          Notiflix.Notify.failure('Failed to update achievement: ' + (err.message || 'Unknown error'));
        }
      });
  }

  private _createNewAchievement(achievementData: IAchievement): void {
    this._achievementService.createAchievement(achievementData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.loadAchievements(true);
          Notiflix.Notify.success('Achievement Created Successfully');
          this.createDialogVisible = false;
        },
        error: (err) => {
          console.error('Error creating achievement:', err);
          Notiflix.Notify.failure('Failed to create achievement: ' + (err.message || 'Unknown error'));
        }
      });
  }

  editAchievement(achievementId: string): void {
    this.selectedAchievement = this.achievementsList.find(achievement => achievement._id === achievementId) || {
      title: '',
      description: '',
      category: '',
      criteria: '',
      threshold: 0,
      icon: '',
      isActive: false
    };
    this.achievementForm.patchValue({
      title: this.selectedAchievement.title,
      description: this.selectedAchievement.description,
      category: this.selectedAchievement.category,
      criteria: this.selectedAchievement.criteria,
      threshold: this.selectedAchievement.threshold,
      icon: this.selectedAchievement.icon,
      isActive: this.selectedAchievement.isActive
    });
    this.createDialogVisible = true;
  }

  activateAchievement(achievementId: string): void {
    this._achievementService.activateAchievement(achievementId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          const achievement = this.achievementsList.find(a => a._id === achievementId);
          if (achievement) {
            achievement.isActive = true;
          }
          this.applyFilters();
          Notiflix.Notify.success('Achievement activated successfully');
        },
        error: (err) => {
          console.error('Error activating achievement:', err);
          Notiflix.Notify.failure('Failed to activate achievement');
        }
      });
  }

  deactivateAchievement(achievementId: string): void {
    this._achievementService.deactivateAchievement(achievementId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          const achievement = this.achievementsList.find(a => a._id === achievementId);
          if (achievement) {
            achievement.isActive = false;
          }
          this.applyFilters();
          Notiflix.Notify.success('Achievement deactivated successfully');
        },
        error: (err) => {
          console.error('Error deactivating achievement:', err);
          Notiflix.Notify.failure('Failed to deactivate achievement');
        }
      });
  }


  deleteAchievement(achievementId: string): void {
    Notiflix.Confirm.show(
      'Confirm Deletion', 
      'Are you sure you want to delete this achievement?',
      'Yes', 
      'No', 
      () => {
        this._achievementService.deleteAchievement(achievementId)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: () => {
              this.achievementsList = this.achievementsList.filter(achievement => achievement._id !== achievementId);
              this.applyFilters(); 
              Notiflix.Notify.success('Achievement deleted successfully');
            },
            error: (err) => {
              console.error('Error deleting achievement:', err);
              Notiflix.Notify.failure('Failed to delete achievement');
            }
          });
      },
      () => {
      },
      {
        width: '320px',
        borderRadius: '8px',
        titleColor: '#ff5549',
        okButtonBackground: '#ff5549',
        cancelButtonBackground: '#a9a9a9'
      }
    );
  }

  getCategoryLabel(value: string): string {
    const category = this.categoryOptions.find(option => option.value === value);
    return category ? category.label : value;
  }

  getIconClass(iconValue: string): string {
    return iconValue || 'fas fa-award'; 
  }

  getAchievementStatusBadge(achievement: IAchievement): { text: string, classes: string } {
    return achievement.isActive 
      ? { text: 'Active', classes: 'bg-green-100 text-green-600' } 
      : { text: 'Inactive', classes: 'bg-red-100 text-red-600' };
  }
  
  getAchievementMenuItems(achievement: IAchievement): MenuItem[] {
    return [
      {
        label: 'View Details',
        icon: 'fas fa-eye',
        command: () => this.showAchievementDetails(achievement._id as string)
      },
      {
        label: 'Edit Achievement',
        icon: 'fas fa-edit',
        command: () => this.editAchievement(achievement._id as string)
      },
      {
        label: achievement.isActive ? 'Deactivate' : 'Activate',
        icon: achievement.isActive ? 'fas fa-ban' : 'fas fa-check-circle',
        command: () => achievement.isActive 
          ? this.deactivateAchievement(achievement._id as string) 
          : this.activateAchievement(achievement._id as string)
      },
      {
        label: 'Delete',
        icon: 'fas fa-trash',
        command: () => this.deleteAchievement(achievement._id as string)
      }
    ];
  }
}