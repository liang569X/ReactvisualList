
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Skeleton } from 'antd';

const intersectionList = ({ children, threshold = 0.5, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      requestAnimationFrame(() => {
        setIsVisible(true);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      });
    }
  }, []);

  useEffect(() => {
    const currentRef = ref.current;
    observerRef.current = new IntersectionObserver(handleIntersection, { threshold });

    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  const handleImageLoad = useCallback(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  // 如果子组件是图片
  if (React.isValidElement(children) && children.type === 'img') {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        {isVisible && (
          <React.Fragment>
            {React.cloneElement(children, {
              onLoad: handleImageLoad,
              style: { ...children.props.style, display: isLoaded ? 'block' : 'none' }
            })}
            {!isLoaded && (
              <Skeleton.Image 
                style={{
                  width: children.props.width || '100%',
                  height: children.props.height || '300px'
                }}
                active
              />
            )}
          </React.Fragment>
        )}
        {!isVisible && (placeholder || <Skeleton.Image active />)}
      </div>
    );
  }

  // 非图片
  return (
    <div ref={ref}>
      {isVisible ? children : placeholder || <Skeleton active />}
    </div>
  );
};

export default intersectionList;
