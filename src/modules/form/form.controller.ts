import { FormService } from './form.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ValidateFieldRequestDto } from './dtos/validate-field.request.dto';
import { Post, Body, HttpStatus, Controller, HttpCode } from '@nestjs/common';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { ValidateFieldResponseDto } from 'src/modules/form/dtos/validate-field-response.dto';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post('field/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar campo único de formularios',
    description:
      'Verifica os campos dos formuários de login que devem ser únicos, como cpf, email e phoneNumber.',
  })
  @ApiResponseDecorator({ type: ValidateFieldResponseDto })
  async validateField(
    @Body() validateFieldRequestDto: ValidateFieldRequestDto,
  ): Promise<ValidateFieldResponseDto> {
    return await this.formService.validateField(validateFieldRequestDto);
  }
}
