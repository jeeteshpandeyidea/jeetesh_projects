import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

const UPLOAD_SUBDIR = 'assets/uploads';

function getUploadDir(): string {
  const dir = join(process.cwd(), UPLOAD_SUBDIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, getUploadDir());
        },
        filename: (_req, file, cb) => {
          const name = Date.now().toString(36) + '-' + (file.originalname || 'image').replace(/\s+/g, '-');
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { path: '' };
    return { path: `${UPLOAD_SUBDIR}/${file.filename}` };
  }

  @Post()
  @ApiBody({ type: CreateAssetDto })
  create(@Body() dto: CreateAssetDto, @Req() req: Request) {
    const body =
      req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
        ? (req.body as Record<string, unknown>)
        : (dto as unknown as Record<string, unknown>);
    const createDto: CreateAssetDto = {
      title: (body.title ?? dto?.title) as string,
      imageUrl: (body.imageUrl ?? dto?.imageUrl) as string,
      categoryId: (body.categoryId ?? body.category_id ?? dto?.categoryId) as string,
      description: body.description !== undefined ? (body.description as string) : dto?.description,
      thumbnailUrl: body.thumbnailUrl !== undefined ? (body.thumbnailUrl as string) : dto?.thumbnailUrl,
      subcategoryId: (body.subcategoryId ?? body.subcategory_id ?? dto?.subcategoryId) as string | undefined,
      accessLevel: body.accessLevel !== undefined ? (body.accessLevel as string) : dto?.accessLevel,
      isPlaceholder: body.isPlaceholder !== undefined ? (body.isPlaceholder as boolean) : dto?.isPlaceholder,
      status: body.status !== undefined ? (body.status as string) : dto?.status,
      sortOrder: body.sortOrder !== undefined ? (body.sortOrder as number) : dto?.sortOrder,
      tags: body.tags !== undefined ? (body.tags as string[]) : dto?.tags,
      code: body.code !== undefined ? (body.code as string) : dto?.code,
      slug: body.slug !== undefined ? (body.slug as string) : dto?.slug,
      createdBy: body.createdBy !== undefined ? (body.createdBy as string) : dto?.createdBy,
    };
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
