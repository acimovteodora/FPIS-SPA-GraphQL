import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Project } from '../_model/project';
import { ProjectService } from '../_services/project.service';
import { ProjectPlan } from '../_model/projectPlan';
import { ProjectPlanService } from '../_services/projectPlan.service';
import { Apollo, gql } from 'apollo-angular';

const GET_PLAN = gql`
      query planByProject($projectId:Long){
        planQuery{
          planByProject(projectId:$projectId){
            projectID
            documentID
            title
            estimatedStartDate
            dateOfCompilation
            duration
            phases{
              phaseID
              description
              requiredSkills{
                skillID
                name
                description
              }
              engagements{
                studentID
                phaseID
                name
              }
            }
          }
        }
      }
    `;

@Injectable()
export class ProjectPlanResolver implements Resolve<ProjectPlan> {
    constructor(private projectPlanService: ProjectPlanService,
                private router: Router, private apollo: Apollo) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ProjectPlan> {

     return this.apollo
      .watchQuery({query: GET_PLAN,
        variables: {
          projectId: route.params['id'],
        }})
        .valueChanges.pipe(map(({ data }) => data['planQuery']), catchError(error => {
                  // console.log('greska u resolveru');
                  return of(null);
              }));

        // return this.projectPlanService.getByProject(route.params['id'])
        // .pipe(
        //     catchError(error => {
        //         return of(null);
        //     })
        // )
    }
}
