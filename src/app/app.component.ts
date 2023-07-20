import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { NotificationService } from './services/notification.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'reactiveDeclarative';
  showLoader$ = this.loaderService.loadingAction$;

  successMessage$ = this.notificationService.successMessageAction$.pipe(
    tap((message) => {
      if (message) {
        setTimeout(() => {
          this.notificationService.clearAllMessages();
        }, 3000);
      }
    })
  );
  errorMessage$ = this.notificationService.errorMessageAction$.pipe(
    tap((message) => {
      console.log(message);
      if (message) {
        setTimeout(() => {
          this.notificationService.clearAllMessages();
        }, 3000);
      }
    })
  );

  constructor(
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}
}
