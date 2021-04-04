import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {APOLLO_OPTIONS} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routes';
import { ProjectsResolver } from './_resolvers/projects.resolver';
import { ProjectsComponent } from './_start-page/projects/projects.component';
import { ProjectService } from './_services/project.service';
import { ProjectResolver } from './_resolvers/project.resolver';
import { Project_mainComponent } from './selected_project/project_main/project_main.component';
import { ApplicationsComponent } from './applications/applications/applications.component';
import { ApplicationService } from './_services/application.service';
import { ApplicationsResolver } from './_resolvers/applications.resolver';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectPlanComponent } from './selected_project/projectPlan/projectPlan.component';
import { PhaseComponent } from './selected_project/phase/phase.component';
import { AcceptedStudentsResolver } from './_resolvers/acceptedStudents.resolver';
import { ProjectPlanResolver } from './_resolvers/projectPlan.resolver';
import { StudentsResolver } from './_resolvers/students.resolver';
import { AlertifyService } from './_services/alertify.service';
import { StudentApplicationComponent } from './applications/studentApplication/studentApplication.component';
import { JwtModule } from '@auth0/angular-jwt';
import { EmployeeAuthComponent } from './_start-page/employeeAuth/employeeAuth.component';
import { NavComponent } from './nav/nav.component';
import { GraphQLModule } from './graphql.module';
import { defaultDataIdFromObject } from '@apollo/client/core';

const myCache = new InMemoryCache({
  resultCaching: false,
  // dataIdFromObject(responseObject) {
  //   switch (responseObject.__typename) {
  //     // case 'ProjectPlanQuery': return `ProjectPlanQuery:${responseObject.planByProject["projectId"]}`;
  //     case 'ProjectPlanType': return `ProjectPlanType:${responseObject.projectID}:${responseObject.email}`;
  //     case 'EngagementType': return `ProjectPlanType:${responseObject.phaseID}:${responseObject.studentID}`;
  //     default: return defaultDataIdFromObject(responseObject);
  //   }
  // }
  typePolicies: {
    ProjectPlanQuery: {
      keyFields:["planByProject",["projectID"]]
    },
    ProjectQuery: {
      keyFields:["projectById",["projectID"]]
    },
    ProjectPlanMutation: {
      keyFields:["editProjectPlan"]
    },
    StudentQuery: {
      keyFields:["acceptedStudents"]
    }
    // ProjectPlanType: {
    //   keyFields: ["projectID"]
    // },
    // PhaseType: {
    //   keyFields:["phaseID"]
    // },
    // SkillType: {
    //   keyFields:["skillID"]
    // },
    // EngagementType: {
    //   keyFields:["phaseID","studentID"]
    // }
  },
});

@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    Project_mainComponent,
    ApplicationsComponent,
    ProjectPlanComponent,
    PhaseComponent,
    StudentApplicationComponent,
    EmployeeAuthComponent,
    NavComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5000'],
        disallowedRoutes: ['localhost:5000/api/employee'],
      },
    }),
    GraphQLModule
  ],
  providers: [
    ProjectsResolver,
    ProjectService,
    ProjectResolver,
    ApplicationService,
    ApplicationsResolver,
    AcceptedStudentsResolver,
    ProjectPlanResolver,
    StudentsResolver,
    AlertifyService,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: myCache,
          link: httpLink.create({
            uri: 'https://localhost:5001/graphql/',
          }),
        };
      },
      deps: [HttpLink],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function tokenGetter() {
  return localStorage.getItem('token');
}
