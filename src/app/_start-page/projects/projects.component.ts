import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/_services/project.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/_model/project';
import { Observable, of } from 'rxjs';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { catchError, map } from 'rxjs/operators';

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
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[];
  projects2: Observable<Project[]>;
  loading = true;

  private query: QueryRef<any>;

  constructor(private projectsService: ProjectService,
              private router: Router,
              private route: ActivatedRoute,
              private alertify: AlertifyService, private apollo: Apollo) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.projects = data['projects'];
    });


    // console.log('Ovo je proslo');
    // this.apollo
    //   .watchQuery({query: GET_PROJECT
    //    })
    //     .valueChanges.subscribe( ({data})  => {
    //       // this.loading = loading;
    //       console.log('Data + '+ data);
    //       this.projects = data['projectQuery'].projects;
    //       console.log('Projects + ' + this.projects);
    //     });

    // this.projects2 = this.apollo
    // .watchQuery({query: GET_PROJECT
    //  })
    //   .valueChanges.pipe(map((result) => result['projectQuery'].projects));
    //   this.projects2.subscribe(data => this.projects = data['projects']);
    //   // console.log('Data + '+ result['projectQuery'].projects);
    //   console.log('Projects + ' + this.projects2);
    //   this.projects2.subscribe(data => this.projects = data);
    //   console.log('Projects + ' + this.projects);

    if(this.projects == null){
      this.alertify.error('Не постоји ни један пројекат!');
    }
  }

}
