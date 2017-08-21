import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { PubNubAngular} from 'pubnub-angular2';

import { AppComponent } from './app.component';
import { AppDirective } from './app.directive';



@NgModule({
  declarations: [
    AppComponent,
    AppDirective

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [PubNubAngular],
  bootstrap: [AppComponent]
})
export class AppModule { }
