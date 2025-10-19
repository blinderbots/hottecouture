'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Scissors, Sparkles } from 'lucide-react';
import { OrderType } from '@/lib/types/database';
import {
  getPipelineConfig,
  calculateEstimatedCompletion,
} from '@/lib/workflow/pipeline-system';

interface PipelineSelectorProps {
  selectedPipeline: OrderType;
  onPipelineChange: (pipeline: OrderType) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export function PipelineSelector({
  selectedPipeline,
  onPipelineChange,
  onNext,
  onPrev,
}: PipelineSelectorProps) {
  const pipelines = [
    {
      type: 'alteration' as OrderType,
      config: getPipelineConfig('alteration'),
      icon: Scissors,
      features: [
        'Standard alterations',
        'Quick turnaround',
        'Fixed pricing',
        'Quality guarantee',
      ],
    },
    {
      type: 'custom' as OrderType,
      config: getPipelineConfig('custom'),
      icon: Sparkles,
      features: [
        'Custom design work',
        'Personal consultation',
        'Unique creations',
        'Premium materials',
      ],
    },
  ];

  const getEstimatedTime = (pipelineType: OrderType) => {
    const estimate = calculateEstimatedCompletion(pipelineType, false);
    return {
      days: estimate.days,
      hours: estimate.hours,
      isRush: false,
    };
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='text-center flex-1'>
          <h2 className='text-xl font-bold mb-1'>Choose Your Service Type</h2>
          <p className='text-sm text-gray-600'>
            Select the type of work you need done
          </p>
        </div>
        <Button
          type='button'
          onClick={onNext}
          className='px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
        >
          Next Step →
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {pipelines.map(({ type, config, icon: Icon, features }) => {
          const isSelected = selectedPipeline === type;
          const estimate = getEstimatedTime(type);

          return (
            <Card
              key={type}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:shadow-md hover:scale-102'
              }`}
              onClick={() => onPipelineChange(type)}
            >
              <CardHeader className='text-center pb-2'>
                <div className='mx-auto mb-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                  <Icon className='w-5 h-5 text-primary' />
                </div>
                <CardTitle className='text-base'>{config.name}</CardTitle>
                <CardDescription className='text-xs'>
                  {config.description}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-2 pt-0'>
                {/* Features */}
                <div className='space-y-1'>
                  {features.map((feature, index) => (
                    <div key={index} className='flex items-center text-xs'>
                      <div className='w-1 h-1 rounded-full bg-primary mr-2' />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Time Estimate */}
                <div className='bg-gray-50 rounded-lg p-2'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-xs font-medium text-gray-600'>
                      Estimated Time
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='flex items-center text-xs'>
                      <Clock className='w-3 h-3 mr-1 text-gray-500' />
                      <span className='font-medium'>{estimate.days} days</span>
                    </div>
                    <div className='text-xs text-gray-500'>
                      ~{estimate.hours} hours
                    </div>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className='text-center'>
                  <div className='text-xs text-gray-600 mb-1'>
                    {type === 'alteration' ? 'Starting at' : 'Consultation'}
                  </div>
                  <div className='text-sm font-bold text-primary'>
                    {type === 'alteration' ? '$15' : 'Free'}
                  </div>
                </div>

                {/* Selection Button */}
                <div className='flex items-center justify-center'>
                  {isSelected ? (
                    <div className='w-full py-1.5 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg text-center shadow-lg text-xs'>
                      ✓ Selected
                    </div>
                  ) : (
                    <div className='w-full py-1.5 px-3 bg-gray-100 text-gray-600 font-medium rounded-lg text-center border border-gray-200 text-xs'>
                      Select This Option
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Comparison - Compact */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-center text-base'>
            Pipeline Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {pipelines.map(({ type, config }) => (
              <div key={type} className='space-y-1'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm'>{config.icon}</span>
                  <h4 className='font-semibold text-xs'>{config.name}</h4>
                </div>
                <div className='space-y-1 text-xs'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Timeline:</span>
                    <span className='font-medium'>
                      {config.estimatedDays} days
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Assignee:</span>
                    <span className='font-medium capitalize'>
                      {config.defaultAssignee}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
