import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Subscription, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Project } from '../_model/project';
import { ProjectService } from '../_services/project.service';

@Injectable()
export class ProjectsResolver implements Resolve<Observable<Project[]>> {
    constructor(private projectService: ProjectService,
                private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Project[]> {
        return this.projectService.getAll()
        .pipe(
            catchError(error => {
                return of(null);
            })
        )
    }
}
