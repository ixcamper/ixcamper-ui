import { Component } from '@angular/core';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [NavbarComponent], // Add Navbar here
	template: `
		<app-navbar></app-navbar>

		<div class="container-fluid mt-4">
			<div class="row g-4">
				<div class="col-md-4">
					<div class="card border-0 shadow-sm p-3">
						<div class="card-body">
							<h6 class="text-muted small text-uppercase fw-bold">Gateway Status</h6>
							<div class="d-flex align-items-center mt-2">
								<span class="badge bg-success-subtle text-success me-2"
									>● Online</span
								>
								<h4 class="mb-0">Active</h4>
							</div>
						</div>
					</div>
				</div>

				<div class="col-md-4">
					<div class="card border-0 shadow-sm p-3">
						<div class="card-body">
							<h6 class="text-muted small text-uppercase fw-bold">Auth Service</h6>
							<h4 class="mt-2 text-primary">JWT / SPNEGO</h4>
						</div>
					</div>
				</div>

				<div class="col-md-4">
					<div class="card border-0 shadow-sm p-3">
						<div class="card-body">
							<h6 class="text-muted small text-uppercase fw-bold">Storage</h6>
							<h4 class="mt-2 text-primary">Neon PostgreSQL</h4>
						</div>
					</div>
				</div>

				<div class="col-12 mt-4">
					<div class="card border-0 shadow-sm p-4">
						<h5 class="fw-bold mb-3">Welcome to the ixcamper app</h5>
						<p class="text-muted">
							Your full-stack application is successfully communicating through the
							Spring Cloud Gateway.
						</p>
						<hr />
						<button class="btn btn-primary btn-sm">Refresh System Logs</button>
					</div>
				</div>
			</div>
		</div>
	`,
})
export class DashboardComponent {}
