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

/**
 * Component for managing subscription plans
 */
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
  plans: SubscriptionPlan[] = [];
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
  private readonly _destroy$ = new Subject<void>();

  /**
   * @param _formBuilder Angular FormBuilder service
   * @param _subscriptionPlanService Service for subscription plan operations
   * @param _confirmationService PrimeNG confirmation service
   */
  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _subscriptionPlanService: SubscriptionPlanService,
    private readonly _confirmationService: ConfirmationService
  ) {}

  /**
   * Initializes the component, form, and loads plans
   */
  ngOnInit(): void {
    this._initializeForm();
    this._loadPlans();
  }
  
  /**
   * Cleans up resources when component is destroyed
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Initializes the plan form with default values
   */
  private _initializeForm(): void {
    this.planForm = this._formBuilder.group({
      type: ['basic', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      isPopular: [false]
    });
  }

  /**
   * Loads subscription plans from the service
   */
  private _loadPlans(): void {
    this.loading = true;
    
    this._subscriptionPlanService.getPlans()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.plans = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure('Failed to load subscription plans');
          console.error('Error loading plans:', error);
        }
      });
  }

  /**
   * Opens the dialog to edit an existing plan
   * @param plan The plan to edit
   */
  openDialog(plan: SubscriptionPlan): void {
    this.dialogTitle = 'Edit Plan';
    this.editMode = true;
    this.currentPlanId = plan._id;
    this._populateForm(plan);
    this.showDialog = true;
  }

  /**
   * Opens the dialog to create a new plan
   */
  openNewPlanDialog(): void {
    this.dialogTitle = 'Create New Plan';
    this.editMode = false;
    this.currentPlanId = '';
    this._resetForm();
    this.showDialog = true;
  }

  /**
   * Closes the plan dialog
   */
  closeDialog(): void {
    this.showDialog = false;
  }

  /**
   * Resets the form to default values and clears selected features
   */
  private _resetForm(): void {
    this.planForm.reset({
      type: 'basic',
      price: 0,
      description: '',
      isPopular: false
    });
    
    this.availableFeatures.forEach(feature => {
      feature.selected = false;
    });
  }

  /**
   * Populates the form with data from an existing plan
   * @param plan The plan to populate the form with
   */
  private _populateForm(plan: SubscriptionPlan): void {
    this.planForm.patchValue({
      type: plan.type,
      price: plan.price,
      description: plan.description,
      isPopular: plan.isPopular || false
    });

    this.availableFeatures.forEach(feature => {
      feature.selected = false;
    });

    plan.features.forEach(featureName => {
      const existingFeature = this.availableFeatures.find(f => f.name === featureName);
      
      if (existingFeature) {
        existingFeature.selected = true;
      } else {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.availableFeatures.push({
          id,
          name: featureName,
          selected: true
        });
      }
    });
  }

  /**
   * Toggles selection state of a feature
   * @param feature The feature to toggle
   */
  toggleFeature(feature: PlanFeature): void {
    feature.selected = !feature.selected;
  }

  /**
   * Adds a new custom feature to the available features list
   */
  addCustomFeature(): void {
    const trimmedFeatureName = this.newFeatureName.trim();
    
    if (!trimmedFeatureName) {
      Notiflix.Notify.warning('Please enter a feature name');
      return;
    }
    
    // Check if feature already exists
    const featureExists = this.availableFeatures.some(
      f => f.name.toLowerCase() === trimmedFeatureName.toLowerCase()
    );
    
    if (featureExists) {
      Notiflix.Notify.warning('This feature already exists');
      return;
    }
    
    const id = `custom_${Date.now()}`;
    this.availableFeatures.push({
      id,
      name: trimmedFeatureName,
      selected: true
    });
    
    this.newFeatureName = '';
    Notiflix.Notify.success('Custom feature added successfully');
  }

  /**
   * Saves the current plan (creates new or updates existing)
   */
  savePlan(): void {
    if (!this.planForm.valid) {
      this._markFormControlsAsTouched();
      Notiflix.Notify.warning('Please fill all required fields correctly');
      return;
    }
    
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
    
    const saveOperation = this._subscriptionPlanService.updatePlan(plan);
    
    saveOperation
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          const successMessage = 'Plan updated successfully' ;
          Notiflix.Notify.success(successMessage);
          this.closeDialog();
          this._loadPlans();
        },
        error: (error) => {
          this.loading = false;
          const errorMessage =  'Failed to update plan' ;
          Notiflix.Notify.failure(errorMessage);
          console.error('Error saving plan:', error);
        }
      });
  }
  
  /**
   * Marks all form controls as touched to trigger validation messages
   */
  private _markFormControlsAsTouched(): void {
    Object.keys(this.planForm.controls).forEach(key => {
      const control = this.planForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }
}