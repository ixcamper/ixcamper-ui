import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';

@Component({
	selector: 'app-navbar',
	template: '<div>Mock Navbar</div>',
})
class MockNavbarComponent {}

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DashboardComponent],
		})
			.overrideComponent(DashboardComponent, {
				remove: {
					imports: [NavbarComponent],
				},
				add: {
					imports: [MockNavbarComponent],
				},
			})
			.compileComponents();

		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
