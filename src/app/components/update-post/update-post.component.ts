import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { tap } from 'rxjs';
import { CategoryService } from 'src/app/services/category.service';
import { DeclarativeCategoryService } from 'src/app/services/declarative-category.service';
import { DeclarativePostService } from 'src/app/services/declarative-post.service';

@Component({
  selector: 'app-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePostComponent {
  postId = '';
  postForm = new UntypedFormGroup({
    title: new UntypedFormControl(''),
    description: new UntypedFormControl(''),
    categoryId: new UntypedFormControl(''),
  });

  categories$ = this.categoryService.categories$;

  post$ = this.postService.post$.pipe(
    tap((post) => {
      post?.id && (this.postId = post.id);
      this.postForm.setValue({
        title: post?.title,
        description: post?.description,
        categoryId: post?.categoryId,
      });
    })
  );
  constructor(
    private categoryService: DeclarativeCategoryService,
    private postService: DeclarativePostService
  ) {}

  onUpdatePost() {
    const postDetails = {
      ...this.postForm.value,
      id: this.postId,
    };

    // console.log(postDetails);

    this.postService.updatePost(postDetails);
  }
}
