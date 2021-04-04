import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectPlan } from '../_model/projectPlan';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectPlanService {
  baseUrll = environment.apiUrl + '/projectplan/';
  plan: any;



  constructor(private http: HttpClient, private apollo: Apollo) { }

  getByProject(id: any): Observable<ProjectPlan> {
  //   const GET_PLAN = gql`
  //   query planByProject($projectId:Long){
  //     planQuery{
  //       planByProject(projectId:$projectId){
  //         projectID
  //         documentID
  //         title
  //         estimatedStartDate
  //         dateOfCompilation
  //         duration
  //         phases{
  //           phaseID
  //           description
  //           requiredSkills{
  //             skillID
  //             name
  //             description
  //           }
  //           engagements{
  //             studentID
  //             phaseID
  //             name
  //           }
  //         }
  //       }
  //     }
  //   }
  // `;
  //  this.apollo
  //   .watchQuery({query: GET_PLAN,
  //     variables: {
  //       projectId: id,
  //     }})
  //   .valueChanges
  //   .subscribe( data  => {
  //           console.log(data);
  //           // this.plan = data.data as Observable<ProjectPlan>;
  //           return data;
  //   });
  //   console.log('Plan : ' + this.plan);
  //   return this.plan;
    return this.http.get<ProjectPlan>(this.baseUrll + 'project/' + id);
  }

  getByCriteria(criteria: string): Observable<ProjectPlan[]> {
    return this.http.get<ProjectPlan[]>(this.baseUrll + 'criteria/' + criteria);
  }

  getById(id: any): Observable<ProjectPlan> {
    return this.http.get<ProjectPlan>(this.baseUrll + id);
  }

  delete(id: any) {
    return this.http.delete<ProjectPlan>(this.baseUrll + id);
  }

  insertProjectPlan(employeeId: number, data: ProjectPlan) {
    return this.http.post<ProjectPlan>(this.baseUrll + employeeId, data);
  }

  updateProjectPlan(data: ProjectPlan) {
    console.log(this.baseUrll + data.documentID);
    return this.http.put<ProjectPlan>(this.baseUrll + data.documentID, data);
  }
}
