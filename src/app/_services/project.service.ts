import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { Observable, Subscription } from 'rxjs';
import { Project } from '../_model/project';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const GET_PROJECT = gql`
query allProjects{
  projectQuery{
    projects{
      projectID
      description
      projectProposal{
        projectProposalID
        name
        description
         activities
        company{
          name
        }
      }
    }
  }
}
    `;
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  baseUrl = environment.apiUrl + '/project/';
  private query: QueryRef<any>;

  constructor(private http: HttpClient, private apollo: Apollo) { }

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);

    // this.query = this.apollo.watchQuery({
    //   query: GET_PROJECT,
    //   variables: {}
    // });

    // this.query.valueChanges.subscribe(result => {
    //   console.log(result.data.projectQuery.projects);
    //   return result.data.projectQuery.projects;
    // });
    // return null;
  }

  getByID(id: number): Observable<Project> {
    return this.http.get<Project>(this.baseUrl + id);
  }

  getByCriteria(criteria: string): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl + criteria);
  }
}
