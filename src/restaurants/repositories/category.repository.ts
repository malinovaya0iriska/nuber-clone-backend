import { Repository } from 'typeorm';
import { Category } from 'src/restaurants/entities/category.entity';
import { CustomRepository } from 'src/customRepository/typeorm-ex.decorator';

@CustomRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string) {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
