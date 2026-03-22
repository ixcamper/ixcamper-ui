import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';

@Component({
	selector: 'app-navbar',
	template: '<div>Mock Navbar</div>',
})
class MockNavbarComponent {}

describe('SettingsComponent', () => {
	let component: SettingsComponent;
	let fixture: ComponentFixture<SettingsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SettingsComponent],
		})
			.overrideComponent(SettingsComponent, {
				remove: {
					imports: [NavbarComponent],
				},
				add: {
					imports: [MockNavbarComponent],
				},
			})
			.compileComponents();

		fixture = TestBed.createComponent(SettingsComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
