import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import Notiflix from 'notiflix';
import { Subject, takeUntil } from 'rxjs';
import { SubscriptionPlan, SubscriptionPlanService } from '../../../../core/services/admin/subscription-plan/subscription-plan.service';

interface PlanFeature {
  id: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.scss'
})
export class SubscriptionPlansComponent implements OnInit, OnDestroy {
  plans: SubscriptionPlan[] |undefined = [];
  showDialog = false;
  dialogTitle = 'Create New Plan';
  planForm!: FormGroup;
  loading = false;

  availableFeatures: PlanFeature[] = [
    { id: 'participants250', name: 'Up to 250 Participants', selected: false },
    { id: 'participantsUnlimited', name: 'Unlimited Participants', selected: false },
    { id: 'emailComm', name: 'Email Communications', selected: false },
    { id: 'multipleTickets', name: 'Multiple Ticket Types', selected: false },
    { id: 'basicSupport', name: 'Basic Support', selected: false },
    { id: 'prioritySupport', name: 'Priority Support', selected: false },
    { id: 'paidEventCreation', name: 'Paid Event Creation', selected: false },
    { id: 'liveStreaming', name: 'Live Event Streaming', selected: false },
    { id: 'oneToOneChat', name: 'One-to-One Chat', selected: false },
    { id: 'eventBasedChat', name: 'Event Based Chat', selected: false },
    { id: 'noPlatformFee', name: 'No Platform Fee', selected: false },
    { id: 'fullRefund', name: 'Full Refund Options', selected: false }
  ];

  newFeatureName = '';
  editMode = false;
  currentPlanId = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private subscriptionPlanService: SubscriptionPlanService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPlans();
  }
  
  initializeForm(): void {
    this.planForm = this.fb.group({
      type: ['basic', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      isPopular: [false]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlans(): void {
    this.loading = true;
    this.subscriptionPlanService.getPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(response);
          
          this.plans = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure('Failed to load subscription plans');
          console.error('Error loading plans:', error);
        }
      });
  }

  openDialog(plan: SubscriptionPlan): void {
    this.dialogTitle = 'Edit Plan';
    this.currentPlanId = plan._id;
    this.populateForm(plan);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  populateForm(plan: SubscriptionPlan): void {
    this.planForm.patchValue({
      type: plan.type,
      price: plan.price,
      description: plan.description,
      isPopular: plan.isPopular || false
    });

    this.availableFeatures.forEach(feature => {
      feature.selected = plan.features.includes(feature.name);
    });

    plan.features.forEach(featureName => {
      const exists = this.availableFeatures.some(f => f.name === featureName);
      if (!exists) {
        const id = 'custom_' + Date.now() + Math.random().toString(36).substring(2, 9);
        this.availableFeatures.push({
          id,
          name: featureName,
          selected: true
        });
      }
    });
  }

  toggleFeature(feature: PlanFeature): void {
    feature.selected = !feature.selected;
  }

  addCustomFeature(): void {
    if (this.newFeatureName.trim()) {
      const id = 'custom_' + Date.now();
      this.availableFeatures.push({
        id,
        name: this.newFeatureName,
        selected: true
      });
      this.newFeatureName = '';

      Notiflix.Notify.success('Custom feature added successfully');
    } else {
      Notiflix.Notify.warning('Please enter a feature name');
    }
  }

  savePlan(): void {
    if (this.planForm.valid) {
      const selectedFeatures = this.availableFeatures
        .filter(feature => feature.selected)
        .map(feature => feature.name);
  
      if (selectedFeatures.length === 0) {
        Notiflix.Notify.warning('Please select at least one feature for the plan');
        return;
      }
  
      const plan: SubscriptionPlan = {
        _id: this.currentPlanId,
        type: this.planForm.value.type,
        price: this.planForm.value.price,
        description: this.planForm.value.description,
        features: selectedFeatures,
        isPopular: this.planForm.value.isPopular
      };
  
      this.loading = true;
  
      this.subscriptionPlanService.updatePlan(plan)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            Notiflix.Notify.success('Plan updated successfully');
            this.closeDialog();
            this.loadPlans();
          },
          error: (error) => {
            this.loading = false;
            Notiflix.Notify.failure('Failed to update plan');
            console.error('Error updating plan:', error);
          }
        });
    } else {
      Object.keys(this.planForm.controls).forEach(key => {
        const control = this.planForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
  
      Notiflix.Notify.warning('Please fill all required fields correctly');
    }
  }
}