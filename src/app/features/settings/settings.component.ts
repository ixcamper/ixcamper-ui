import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { LoggerService } from '../../core/services/logger.service';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [CommonModule, NavbarComponent, FormsModule],
	template: `
    <app-navbar></app-navbar>

    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-md-3 mb-4">
          <div class="list-group shadow-sm border-0">
            <button class="list-group-item list-group-item-action active border-0 py-3">
              <i class="bi bi-person-circle me-2"></i> Profile
            </button>
            <button class="list-group-item list-group-item-action border-0 py-3">
              <i class="bi bi-shield-lock me-2"></i> Security
            </button>
            <button class="list-group-item list-group-item-action border-0 py-3">
              <i class="bi bi-bell me-2"></i> Notifications
            </button>
          </div>
        </div>

        <div class="col-md-9">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="fw-bold mb-4">Profile Settings</h4>
              
              <form>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Display Name</label>
                    <input type="text" class="form-control" value="Suhas">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Email Address</label>
                    <input type="email" class="form-control" placeholder="name@example.com">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label small fw-bold">Bio</label>
                  <textarea class="form-control" rows="3" placeholder="Tell us about yourself..."></textarea>
                </div>

                <hr>

                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary me-2">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4" (click)="onSave()">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
	private toast = inject(ToastService);
	private logger = inject(LoggerService);

	onSave() {
		// Simulate an API call
		this.logger.info('Saving settings...');

		// Show the success toast
		this.toast.show('Settings updated successfully!');
	}
}